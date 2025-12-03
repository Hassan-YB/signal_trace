'use client'
import { Icon } from '@iconify/react/dist/iconify.js'
import type { Prospect } from '@/lib/api/services/prospects'
import Loader from '@/app/components/Common/Loader'

interface ProspectsListProps {
  prospects: Prospect[]
  onCreate: () => void
  onEdit: (prospect: Prospect) => void
  onDelete: (id: number) => void
  loading: boolean
}

const ProspectsList = ({ prospects, onCreate, onEdit, onDelete, loading }: ProspectsListProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'hot':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'warm':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'cold':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1)
  }

  return (
    <div className='rounded-xl border border-gray-200 bg-white p-[22px] shadow-sm'>
      <div className='mb-[22px] flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-bold text-gray-900 leading-none'>Prospects</h2>
          <p className='mt-[10px] text-sm text-gray-600'>
            Manage your prospects and track their status
          </p>
        </div>
        <button
          onClick={onCreate}
          className='rounded-lg border border-primary bg-primary px-5 py-3 text-base font-medium text-white transition duration-300 ease-in-out hover:bg-primary/90'>
          <Icon icon='fa:plus' className='mr-2 inline' />
          Add Prospect
        </button>
      </div>

      {loading ? (
        <div className='flex justify-center py-8'>
          <Loader />
        </div>
      ) : prospects.length === 0 ? (
        <div className='py-12 text-center'>
          <Icon icon='fa:users' className='mx-auto text-6xl text-gray-400' />
          <p className='mt-4 text-lg font-medium text-gray-600'>No prospects yet</p>
          <p className='mt-2 text-sm text-gray-500'>Get started by adding your first prospect</p>
          <button
            onClick={onCreate}
            className='mt-6 rounded-lg border border-primary bg-primary px-5 py-3 text-base font-medium text-white transition duration-300 ease-in-out hover:bg-primary/90'>
            <Icon icon='fa:plus' className='mr-2 inline' />
            Add Your First Prospect
          </button>
        </div>
      ) : (
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead>
              <tr className='border-b border-gray-200'>
                <th className='px-4 py-3 text-left text-sm font-medium text-gray-700'>Name</th>
                <th className='px-4 py-3 text-left text-sm font-medium text-gray-700'>Company</th>
                <th className='px-4 py-3 text-left text-sm font-medium text-gray-700'>Email</th>
                <th className='px-4 py-3 text-left text-sm font-medium text-gray-700'>Status</th>
                <th className='px-4 py-3 text-left text-sm font-medium text-gray-700'>Intent Score</th>
                <th className='px-4 py-3 text-right text-sm font-medium text-gray-700'>Actions</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-200'>
              {prospects.map((prospect) => (
                <tr key={prospect.id} className='hover:bg-gray-50'>
                  <td className='px-4 py-3'>
                    <div className='text-sm font-medium text-gray-900'>{prospect.full_name}</div>
                    {prospect.title && (
                      <div className='text-xs text-gray-500'>{prospect.title}</div>
                    )}
                  </td>
                  <td className='px-4 py-3 text-sm text-gray-900'>{prospect.company_name}</td>
                  <td className='px-4 py-3 text-sm text-gray-600'>
                    {prospect.email || (
                      <span className='text-gray-400'>No email</span>
                    )}
                  </td>
                  <td className='px-4 py-3'>
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${getStatusColor(prospect.status)}`}>
                      {getStatusLabel(prospect.status)}
                    </span>
                  </td>
                  <td className='px-4 py-3 text-sm text-gray-900'>
                    {prospect.intent_score.toFixed(1)}
                  </td>
                  <td className='px-4 py-3 text-right'>
                    <div className='flex items-center justify-end gap-2'>
                      <button
                        onClick={() => onEdit(prospect)}
                        className='rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-primary'
                        title='Edit prospect'>
                        <Icon icon='fa:edit' className='text-lg' />
                      </button>
                      <button
                        onClick={() => onDelete(prospect.id)}
                        className='rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50 hover:text-red-700'
                        title='Delete prospect'>
                        <Icon icon='fa:trash' className='text-lg' />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default ProspectsList

