import Form from '@/src/components/Form'
import { Metadata } from 'next';

export default async function page({ params }: { params: Promise<{ form_id: string }> }) {
    const { form_id } = await params;
    
    return (
        <section className='relative w-full bg-gray-50 min-h-screen p-2'>
            <Form formId={form_id} />
        </section>
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

export async function generateMetadata({ params }: { params: Promise<{ form_id: string }> }): Promise<Metadata> {
    const { form_id } = await params;
    try {
        const response = await fetch(`https://leads.wizards.co.in/api/v1/form/${form_id}`)

        const data: FormResponse = await response.json();
        const title = data.form.title ?? ''
        const description = data.form.description ?? ''

        return {
            title,
            description,
        };
    } catch (error) {
        console.error('❌ Error generating metadata:', error);
        return {
            title: 'Wizards Next Leads Form',
            description: 'Wizards Next Leads Form',
        };
    }
}