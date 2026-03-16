import { AlertCircle, ExternalLink } from "lucide-react";

const DatabaseErrorPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="flex justify-center mb-4">
          <div className="bg-red-100 rounded-full p-4">
            <AlertCircle className="text-red-600 size-8" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">
          Database Connection Error
        </h1>
        
        <p className="text-gray-600 text-center mb-6">
          MongoDB is not accessible. Your IP needs to be whitelisted.
        </p>

        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <p className="text-yellow-700 font-semibold mb-3">
            ⚠️ Quick Fix (2 minutes):
          </p>
          <ol className="text-sm text-yellow-700 space-y-2">
            <li><strong>1.</strong> Go to <a href="https://cloud.mongodb.com" target="_blank" rel="noopener noreferrer" className="underline text-blue-600">MongoDB Atlas</a></li>
            <li><strong>2.</strong> Click "Network Access" in the sidebar</li>
            <li><strong>3.</strong> Click "Add IP Address"</li>
            <li><strong>4.</strong> Click "Add Current IP Address"</li>
            <li><strong>5.</strong> Wait 1-2 minutes</li>
            <li><strong>6.</strong> <button onClick={() => window.location.reload()} className="underline text-blue-600">Refresh this page</button></li>
          </ol>
        </div>

        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
          <p className="text-blue-700 font-semibold mb-2">
            💡 Alternative (Less Secure):
          </p>
          <p className="text-blue-700 text-sm mb-3">
            Allow all IPs by entering <code className="bg-white px-2 py-1 rounded text-xs">0.0.0.0/0</code>
          </p>
          <p className="text-blue-600 text-xs">
            ⚠️ Only use this for development!
          </p>
        </div>

        <div className="flex gap-3">
          <a 
            href="https://cloud.mongodb.com/v2/your-project" 
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            Go to MongoDB Atlas
            <ExternalLink className="size-4" />
          </a>
          <button 
            onClick={() => window.location.reload()}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            Retry Connection
          </button>
        </div>

        <p className="text-gray-500 text-xs text-center mt-6">
          Backend will automatically reconnect every 5 seconds
        </p>
      </div>
    </div>
  );
};

export default DatabaseErrorPage;
