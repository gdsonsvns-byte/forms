import FormHead from './FormHead';
import FormField from './FormField';

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
    res: FormResponse
    formId:string
}


export default function Form({ res,formId }: Props) {
    return (
        <div className='relative max-w-2xl mx-auto p-5 flex flex-col gap-5'>
            <FormHead title={res.form.title} desc={res.form.description ?? ''} />
            <FormField data={res} formId={formId} />
        </div>
    )
}
