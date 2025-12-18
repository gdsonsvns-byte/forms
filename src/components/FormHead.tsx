import React from 'react'

interface Props {
    title: string;
    desc: string
}
export default function FormHead({ title, desc }: Props) {
    return (
        <div className='relative w-full bg-white rounded-lg border border-gray-200 after:absolute after:inset-x-0 after:h-2 after:bg-blue-600 after:top-0 overflow-hidden'>
            <div className='p-5 mt-2'>
                <h1 className='font-semibold text-3xl text-zinc-700'>
                    {title}
                </h1>
                <p className='mt-2 text-sm text-gray-600'>
                    {desc}
                </p>
            </div>
            <div className="border-t border-gray-300 mt-2" />
            <div className='p-5 '>
                <span className='text-sm text-rose-500'>
                    * Indicates required
                </span>
            </div>
        </div>
    )
}
