'use client'
import FormHead from './FormHead';
import FormField from './FormField';
import { useQuery } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import Spinner from './spinner';

export default function Form({ formId }: Props) {
    const hasFormId = !!formId;

    const { data, isLoading, isFetching, error, isError } = useQuery<Form>({
        queryKey: ["view-form", formId],
        queryFn: async () => {
            const res = await axios.get<FormResponse>(`https://leads.wizards.co.in/api/v1/form/${formId}`, {
                withCredentials: true,
            });
            return res.data.form;
        },
        enabled: hasFormId,
    })

    return (
        <div className='relative max-w-2xl mx-auto p-5 flex flex-col gap-5'>
            {
                (isLoading || isFetching) && (
                    <div className='w-full min-h-140 flex items-center justify-center'>
                        <Spinner />
                    </div>
                )
            }
            {
                isError && (
                    <div className="w-full flex justify-center py-20 text-2xl text-red-500">
                        {
                            (error as AxiosError<any>)?.response?.data?.error
                        }
                    </div>
                )
            }

            {
                data && (!isLoading || !isFetching) && (
                    <>
                        <FormHead
                            title={data.title}
                            desc={data.description ?? ''}
                            accountName={data.account.businessName}
                        />
                        <FormField data={data.fields} formId={formId} />
                    </>
                )
            }
        </div>
    )
}


interface FormResponse {
    form: Form;
}
interface Form {
    id: string;
    formsId: string;
    userId: string;
    title: string;
    description: string | null;
    slug: string;
    createdAt: string;
    accountId: string;
    fields: FormField[];
    account: {
        id: string,
        businessName: string
    }
}
interface FormField {
    id: string;
    formId: string;
    label: string;
    type: string;
    options?: string;
    required?: boolean;
    order?: number;
}
interface Props {
    formId: string
}
