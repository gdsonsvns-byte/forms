'use client'
import { FormEvent, useRef, useState } from 'react'
import Spinner from './spinner';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { uploadToCloudinary } from '../lib/cloudinaryUpload';

interface FormField {
    id: string;
    formId: string;
    label: string;
    type: string;
    options?: string;
    required?: boolean;
    order?: number;
}
interface FormFieldProps {
    data: FormField[];
    formId: string
}

export default function FormField({ data, formId }: FormFieldProps) {
    const formRef = useRef<HTMLFormElement>(null);
    const [formKey, setFormKey] = useState(0);

    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [formValues, setFormValues] = useState<Record<string, any>>({});
    const [fileLabels, setFileLabels] = useState<Record<string, string>>({});
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

    const submitMutation = useMutation({
        mutationFn: async (payload: Record<string, any>) => {
            const res = await axios.post(`https://leads.wizards.co.in/api/v1/form/${formId}/response`,
                payload,
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            )
            return res.data
        },

        onSuccess: () => {
            setMessage({ type: 'success', text: 'Record submitted...!' })
            setFormValues({})
            setFileLabels({})
            formRef.current?.reset()
            setFormKey(prev => prev + 1)
            // setTimeout(() => {
            //     window.location.reload()
            // }, 2000)
        },

        onError: (error: AxiosError<any>) => {
            setMessage({
                type: 'error',
                text: error?.response?.data?.error || 'Something went wrong',
            })
        },
    })

    const validateForm = () => {
        for (const field of data) {
            if (!field.required) continue

            const value = formValues[field.id]

            if (field.type === 'file' && (!value || value.length === 0)) {
                setMessage({ type: 'error', text: `${field.label} is required.` })
                return false
            }

            if (field.type === 'checkbox' && (!value || value.length === 0)) {
                setMessage({ type: 'error', text: `${field.label} is required.` })
                return false
            }

            if (!value || value === '') {
                setMessage({ type: 'error', text: `${field.label} is required.` })
                return false
            }
        }
        return true
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setMessage(null)

        if (!validateForm()) return

        try {
            setUploading(true);
            setUploadProgress({});
            const payload: Record<string, any> = {};

            for (const field of data) {
                const value = formValues[field.id];

                if (field.type === "file" && value instanceof FileList) {
                    if (value.length === 0) {
                        payload[field.id] = [];
                        continue;
                    }

                    const uploads = Array.from(value).map((file) =>
                        uploadToCloudinary(
                            file,
                            `forms/${formId}`,
                            (percent) => {
                                setUploadProgress((prev) => ({
                                    ...prev,
                                    [field.id]: percent,
                                }));
                            }
                        )
                    );

                    const results = await Promise.all(uploads);
                    payload[field.id] = results.map((r) => r.secure_url);
                }
                else if (value !== undefined) {
                    payload[field.id] = value;
                }
            }
            await submitMutation.mutateAsync(payload);
        } catch (err: any) {
            setMessage({
                type: "error",
                text: err?.message || "Upload failed",
            });
        }
        finally {
            setUploading(false);
            setUploadProgress({});
        }
    }

    const handleChange = (field: FormField, value: any) => {
        setFormValues((prev) => ({
            ...prev,
            [field.id]: value,
        }));
    };

    const renderField = (field: FormField, options: string[]) => {
        const baseClass =
            "w-full border-zinc-300 rounded-lg px-3 py-2 outline-none text-sm bg-white";

        switch (field.type) {
            case "text":
            case "email":
            case "number":
            case "date":
                return (
                    <input
                        type={field.type}
                        placeholder={`${field.label}${field.required ? "*" : ''}`}
                        className={`${baseClass} rounded-none border-b`}
                        onChange={(e) => handleChange(field, e.target.value)}
                        required={field.required}
                    />
                );

            case "textarea":
                return (
                    <textarea
                        placeholder={`${field.label}${field.required ? "*" : ''}`}
                        rows={3}
                        className={`${baseClass} border`}
                        onChange={(e) => handleChange(field, e.target.value)}
                        required={field.required}
                    />
                );

            case "file":
                return (
                    <div className="relative">
                        <input
                            id={field.id}
                            type="file"
                            className={`${baseClass} hidden`}
                            multiple
                            required={field.required}
                            onChange={(e) => {
                                const files = e.target.files;
                                setFileLabels((prev) => ({
                                    ...prev,
                                    [field.id]:
                                        files && files.length > 0
                                            ? files.length === 1
                                                ? files[0].name
                                                : `${files.length} files selected`
                                            : "",
                                }));
                                handleChange(field, files);
                            }}
                        />

                        <label
                            htmlFor={field.id}
                            className="flex items-center justify-between w-full px-4 py-3 border border-gray-300 rounded-lg cursor-pointer font-mono text-sm text-gray-700"
                        >
                            <span className="truncate">
                                {uploading && uploadProgress[field.id] !== undefined
                                    ? `Uploading ${uploadProgress[field.id]}%`
                                    : fileLabels[field.id] || "Choose file"}
                            </span>

                            {uploading && uploadProgress[field.id] !== undefined ? (
                                <Spinner />
                            ) : (
                                <span className="text-xs text-gray-800">Browse</span>
                            )}
                        </label>
                    </div>
                );

            case "select":
                return (
                    <select
                        className={`${baseClass} border`}
                        onChange={(e) => handleChange(field, e.target.value)}
                        required={field.required}
                    >
                        <option value="">Select...</option>
                        {options.map((opt) => (
                            <option key={opt} value={opt}>
                                {opt}
                            </option>
                        ))}
                    </select>
                );

            case "radio":
                return (
                    <div className="flex flex-col gap-2">
                        {options.map((opt) => (
                            <label key={opt} className="flex items-center gap-2 text-sm">
                                <input
                                    type="radio"
                                    name={field.id}
                                    value={opt}
                                    onChange={() => handleChange(field, opt)}
                                    required={field.required}
                                />
                                <span>{opt}</span>
                            </label>
                        ))}
                    </div>
                );

            case "checkbox":
                return (
                    <div className="flex flex-col gap-2">
                        {options.map((opt) => (
                            <label key={opt} className="flex items-center gap-2 text-sm">
                                <input
                                    type="checkbox"
                                    value={opt}
                                    required={field.required}
                                    onChange={(e) => {
                                        const checked = e.target.checked;
                                        setFormValues((prev) => {
                                            const prevValues = prev[field.id] || [];
                                            return {
                                                ...prev,
                                                [field.id]: checked
                                                    ? [...prevValues, opt]
                                                    : prevValues.filter((v: string) => v !== opt),
                                            };
                                        });
                                    }}
                                />
                                <span>{opt}</span>
                            </label>
                        ))}
                    </div>
                );

            default:
                return <p className="text-zinc-500 text-sm">Unsupported field type</p>;
        }
    };

    const handleClear = () => {
        formRef.current?.reset();
        setFormValues({});
        setMessage(null);
        setFileLabels({})
        setFormKey(prev => prev + 1)
    };

    return (
        <div className='relative w-full flex flex-col gap-5'>
            <form ref={formRef} onSubmit={handleSubmit} key={formKey}>
                <div className="space-y-3 animate-fadeIn">
                    {data.map((field: FormField, index: number) => {
                        let options: string[] = [];
                        if (field.options) {
                            try {
                                options = JSON.parse(field.options);
                            } catch {
                                options = [];
                            }
                        }
                        return (
                            <div
                                key={field.id}
                                className="p-5 rounded-lg border border-zinc-200 bg-white transition-all duration-200 group opacity-0 animate-slideUp"
                                style={{ animationDelay: `${index * 0.08}s` }}
                            >
                                {
                                    (options.length > 0 || field.type === "date" || field.type === "file") &&
                                    <div className="relative flex justify-between mb-2">
                                        <label className={`relative text-sm text-zinc-800 group-hover:text-black transition ${field.required ? "after:content-['*'] after:text-red-600 after:ml-1" : ""} `}>
                                            {field.label}
                                        </label>
                                    </div>
                                }


                                <div className="mt-0">
                                    {renderField(field, options)}
                                </div>
                            </div>
                        );
                    })}

                </div>
                {message && (
                    <p
                        className={`mt-3 text-center ${message.type === "success" ? "text-green-600" : "text-red-600"}`}
                    >
                        {message.text}
                    </p>
                )}
                <div className="space-y-3 animate-fadeIn mt-5 flex justify-between items-center w-full">
                    <button
                        className="w-max bg-blue-600 hover:bg-blue-700 text-white py-2 px-5 text-sm rounded-md cursor-pointer"
                        disabled={submitMutation.isPending || uploading}
                    >
                        {(submitMutation.isPending || uploading) ? <Spinner color='white' /> : "Submit"}
                    </button>
                    <button className='text-sm text-purple-500 cursor-pointer font-medium'
                        onClick={handleClear}
                    >
                        Clear form
                    </button>
                </div>
            </form>
        </div>
    )
}
