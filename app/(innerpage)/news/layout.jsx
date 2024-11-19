import { DataProvider } from '@/context/DataContext'
import React from 'react'

const layout = ({children}) => {
  return (
    <DataProvider>
      <div className='w-full'>
        {children}
      </div>
    </DataProvider>
  )
}

export default layout