import { useState } from 'react'
import PasswordGenerator from '../components/PasswordGenerator'
import Layout from '../components/Layout'

const PasswordGeneratorPage = () => {
  const [useApi, setUseApi] = useState(false)

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Password Generator
          </h1>
          <p className="text-gray-600">
            Generate secure passwords directly in your browser. No data is sent to the server.
          </p>
        </div>

        <div className="mb-4 flex items-center justify-end">
          <label className="flex items-center text-sm text-gray-700">
            <input
              type="checkbox"
              checked={useApi}
              onChange={(e) => setUseApi(e.target.checked)}
              className="mr-2"
            />
            Use backend API (calls password manager service)
          </label>
        </div>

        <PasswordGenerator useApi={useApi} />
      </div>
    </Layout>
  )
}

export default PasswordGeneratorPage







