'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { prospects } from '@/lib/api'
import { isAuthenticated } from '@/utils/api'
import type { Prospect, ProspectRequest } from '@/lib/api/services/prospects'
import Loader from '@/app/components/Common/Loader'
import ProspectsList from './ProspectsList'
import ProspectForm from './ProspectForm'

const ProspectsPage = () => {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [prospectsList, setProspectsList] = useState<Prospect[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingProspect, setEditingProspect] = useState<Prospect | null>(null)

  useEffect(() => {
    // Check authentication
    if (!isAuthenticated()) {
      router.push('/signin')
      return
    }

    // Fetch prospects
    fetchProspects()
  }, [router])

  const fetchProspects = async () => {
    try {
      setLoading(true)
      const response = await prospects.getProspects()
      
      if (response.success && response.data?.prospects) {
        setProspectsList(response.data.prospects)
      } else {
        if (!response.message?.includes('session has expired')) {
          toast.error(response.message || 'Failed to fetch prospects')
        }
      }
    } catch (error: any) {
      if (!error.message?.includes('session has expired')) {
        toast.error('Failed to fetch prospects')
        console.error(error)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingProspect(null)
    setShowForm(true)
  }

  const handleEdit = (prospect: Prospect) => {
    setEditingProspect(prospect)
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this prospect?')) {
      return
    }

    try {
      const response = await prospects.deleteProspect(id)
      
      if (response.success) {
        toast.success(response.message || 'Prospect deleted successfully')
        fetchProspects()
      } else {
        toast.error(response.message || 'Failed to delete prospect')
      }
    } catch (error: any) {
      toast.error('An error occurred. Please try again.')
      console.error(error)
    }
  }

  const handleFormSubmit = async (data: ProspectRequest) => {
    try {
      let response
      
      if (editingProspect) {
        response = await prospects.updateProspect(editingProspect.id, data)
      } else {
        response = await prospects.createProspect(data)
      }
      
      if (response.success) {
        toast.success(response.message || (editingProspect ? 'Prospect updated successfully' : 'Prospect created successfully'))
        setShowForm(false)
        setEditingProspect(null)
        fetchProspects()
      } else {
        const fieldErrors: Record<string, string> = {}
        if (response.errors) {
          Object.keys(response.errors).forEach((key) => {
            const errorValue = response.errors![key]
            if (Array.isArray(errorValue)) {
              fieldErrors[key] = errorValue[0]
            } else if (typeof errorValue === 'string') {
              fieldErrors[key] = errorValue
            }
          })
        }
        return fieldErrors
      }
    } catch (error: any) {
      toast.error('An error occurred. Please try again.')
      console.error(error)
      return {}
    }
  }

  const handleFormCancel = () => {
    setShowForm(false)
    setEditingProspect(null)
  }

  if (loading && prospectsList.length === 0) {
    return <Loader />
  }

  return (
    <div className='min-h-screen bg-slate-100'>
      <div className='container mx-auto px-4 pb-8'>
        {!showForm ? (
          <ProspectsList
            prospects={prospectsList}
            onCreate={handleCreate}
            onEdit={handleEdit}
            onDelete={handleDelete}
            loading={loading}
          />
        ) : (
          <ProspectForm
            prospect={editingProspect}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
          />
        )}
      </div>
    </div>
  )
}

export default ProspectsPage

