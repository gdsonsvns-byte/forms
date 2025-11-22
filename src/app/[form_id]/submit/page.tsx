import Form from '@/src/components/Form'
import React from 'react'

export default async function page({ params }: { params: Promise<{ form_id: string }> }) {
    const { form_id } = await params;
    const response = await fetch(`http:/localhost:3000/api/v1/form/${form_id}`, {
        cache: "no-store",
    })
    if (!response.ok) {
        return <p className="text-red-600 text-center mt-10">Form not found</p>;
    }
    const data = await response.json()

    return (
        <section className='relative w-full bg-gray-100 min-h-screen h-full p-5'>
            <Form res={data} formId={form_id} />
        </section>
    )
}
