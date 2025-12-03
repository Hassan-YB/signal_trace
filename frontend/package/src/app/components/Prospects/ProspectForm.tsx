'use client'
import { useState, useEffect } from 'react'
import type { Prospect, ProspectRequest } from '@/lib/api/services/prospects'

interface ProspectFormProps {
  prospect: Prospect | null
  onSubmit: (data: ProspectRequest) => Promise<Record<string, string> | void>
  onCancel: () => void
}

const ProspectForm = ({ prospect, onSubmit, onCancel }: ProspectFormProps) => {
  const [formData, setFormData] = useState<ProspectRequest>({
    full_name: '',
    company_name: '',
    title: '',
    email: '',
    linkedin_url: '',
    website: '',
    industry: '',
    status: 'cold',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [isFormValid, setIsFormValid] = useState(false)

  useEffect(() => {
    if (prospect) {
      setFormData({
        full_name: prospect.full_name || '',
        company_name: prospect.company_name || '',
        title: prospect.title || '',
        email: prospect.email || '',
        linkedin_url: prospect.linkedin_url || '',
        website: prospect.website || '',
        industry: prospect.industry || '',
        status: prospect.status || 'cold',
      })
    }
  }, [prospect])

  useEffect(() => {
    const isValid =
      formData.full_name.trim() !== '' &&
      formData.company_name.trim() !== ''
    setIsFormValid(isValid)
  }, [formData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    // Clean up form data - remove empty strings for optional fields
    const cleanedData: ProspectRequest = {
      full_name: formData.full_name.trim(),
      company_name: formData.company_name.trim(),
      title: formData.title?.trim() || '',
      email: formData.email?.trim() || '',
      linkedin_url: formData.linkedin_url?.trim() || '',
      website: formData.website?.trim() || '',
      industry: formData.industry?.trim() || '',
      status: formData.status || 'cold',
    }

    const formErrors = await onSubmit(cleanedData)
    if (formErrors) {
      setErrors(formErrors)
    }
    setLoading(false)
  }

  const handleChange = (field: keyof ProspectRequest, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  return (
    <div className='rounded-xl border border-gray-200 bg-white p-[22px] shadow-sm'>
      <div className='mb-[22px]'>
        <h2 className='text-2xl font-bold text-gray-900 leading-none'>
          {prospect ? 'Edit Prospect' : 'Add New Prospect'}
        </h2>
        <p className='mt-[10px] text-sm text-gray-600'>
          {prospect ? 'Update prospect information' : 'Fill in the details to add a new prospect'}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className='mb-[22px]'>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Full Name <span className='text-red-500'>*</span>
          </label>
          <input
            type='text'
            value={formData.full_name}
            onChange={(e) => handleChange('full_name', e.target.value)}
            className={`w-full rounded-lg border border-solid bg-white px-4 py-3 text-base text-gray-900 outline-none transition-all duration-200 border-gray-300 placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20 ${
              errors.full_name ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
            }`}
            placeholder='John Doe'
          />
          {errors.full_name && (
            <p className='mt-1 text-sm text-red-500'>{errors.full_name}</p>
          )}
        </div>

        <div className='mb-[22px]'>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Company Name <span className='text-red-500'>*</span>
          </label>
          <input
            type='text'
            value={formData.company_name}
            onChange={(e) => handleChange('company_name', e.target.value)}
            className={`w-full rounded-lg border border-solid bg-white px-4 py-3 text-base text-gray-900 outline-none transition-all duration-200 border-gray-300 placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20 ${
              errors.company_name ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
            }`}
            placeholder='Acme Inc.'
          />
          {errors.company_name && (
            <p className='mt-1 text-sm text-red-500'>{errors.company_name}</p>
          )}
        </div>

        <div className='mb-[22px]'>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Title
          </label>
          <input
            type='text'
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            className={`w-full rounded-lg border border-solid bg-white px-4 py-3 text-base text-gray-900 outline-none transition-all duration-200 border-gray-300 placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20 ${
              errors.title ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
            }`}
            placeholder='CEO, CTO, etc.'
          />
          {errors.title && (
            <p className='mt-1 text-sm text-red-500'>{errors.title}</p>
          )}
        </div>

        <div className='mb-[22px]'>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Email
          </label>
          <input
            type='email'
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className={`w-full rounded-lg border border-solid bg-white px-4 py-3 text-base text-gray-900 outline-none transition-all duration-200 border-gray-300 placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20 ${
              errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
            }`}
            placeholder='john.doe@example.com'
          />
          {errors.email && (
            <p className='mt-1 text-sm text-red-500'>{errors.email}</p>
          )}
        </div>

        <div className='mb-[22px]'>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            LinkedIn URL
          </label>
          <input
            type='url'
            value={formData.linkedin_url}
            onChange={(e) => handleChange('linkedin_url', e.target.value)}
            className={`w-full rounded-lg border border-solid bg-white px-4 py-3 text-base text-gray-900 outline-none transition-all duration-200 border-gray-300 placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20 ${
              errors.linkedin_url ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
            }`}
            placeholder='https://linkedin.com/in/johndoe'
          />
          {errors.linkedin_url && (
            <p className='mt-1 text-sm text-red-500'>{errors.linkedin_url}</p>
          )}
        </div>

        <div className='mb-[22px]'>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Website
          </label>
          <input
            type='url'
            value={formData.website}
            onChange={(e) => handleChange('website', e.target.value)}
            className={`w-full rounded-lg border border-solid bg-white px-4 py-3 text-base text-gray-900 outline-none transition-all duration-200 border-gray-300 placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20 ${
              errors.website ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
            }`}
            placeholder='https://example.com'
          />
          {errors.website && (
            <p className='mt-1 text-sm text-red-500'>{errors.website}</p>
          )}
        </div>

        <div className='mb-[22px]'>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Industry
          </label>
          <input
            type='text'
            value={formData.industry}
            onChange={(e) => handleChange('industry', e.target.value)}
            className={`w-full rounded-lg border border-solid bg-white px-4 py-3 text-base text-gray-900 outline-none transition-all duration-200 border-gray-300 placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20 ${
              errors.industry ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
            }`}
            placeholder='Technology, Finance, etc.'
          />
          {errors.industry && (
            <p className='mt-1 text-sm text-red-500'>{errors.industry}</p>
          )}
        </div>

        <div className='mb-[22px]'>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Status
          </label>
          <select
            value={formData.status}
            onChange={(e) => handleChange('status', e.target.value as 'cold' | 'warm' | 'hot')}
            className={`w-full rounded-lg border border-solid bg-white px-4 py-3 text-base text-gray-900 outline-none transition-all duration-200 border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 ${
              errors.status ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
            }`}>
            <option value='cold'>Cold</option>
            <option value='warm'>Warm</option>
            <option value='hot'>Hot</option>
          </select>
          {errors.status && (
            <p className='mt-1 text-sm text-red-500'>{errors.status}</p>
          )}
        </div>

        <div className='mt-[22px] flex gap-4'>
          <button
            type='submit'
            disabled={!isFormValid || loading}
            className='rounded-lg border border-primary bg-primary px-5 py-3 text-base font-medium text-white transition duration-300 ease-in-out hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400 disabled:border-gray-400 disabled:hover:bg-gray-400'>
            {loading ? 'Saving...' : prospect ? 'Update Prospect' : 'Create Prospect'}
          </button>
          <button
            type='button'
            onClick={onCancel}
            disabled={loading}
            className='rounded-lg border border-gray-300 bg-white px-5 py-3 text-base font-medium text-gray-700 transition duration-300 ease-in-out hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'>
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export default ProspectForm

