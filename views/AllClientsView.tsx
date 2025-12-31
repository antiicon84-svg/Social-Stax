import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getClients } from '~/services/dbService';
import { Client } from '~/types';
import LoadingSpinner from '@/components/LoadingSpinner';
import Button from '@/components/Button';
import { Users, Search, Plus, Building2, Briefcase, ExternalLink } from 'lucide-react';

const AllClientsView: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const fetchedClients = await getClients();
        setClients(fetchedClients);
      } catch (error) {
        console.error('Failed to fetch clients:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClients();
  }, []);

  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.industry?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">All Clients</h1>
          <p className="text-gray-400">Manage your client portfolio and brand kits.</p>
        </div>
        <Link to="/add-client">
          <Button className="shadow-lg shadow-red-900/20">
            <Plus size={18} className="mr-2" />
            Add New Client
          </Button>
        </Link>
      </div>

      {/* Search Bar */}
      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
        <input 
          type="text" 
          placeholder="Search clients by name or industry..." 
          className="w-full bg-gray-900 border border-gray-800 rounded-2xl pl-12 pr-4 py-4 text-white focus:ring-2 focus:ring-red-600 outline-none transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <LoadingSpinner />
        </div>
      ) : filteredClients.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map(client => (
            <Link 
              key={client.id} 
              to={`/client/${client.id}`}
              className="group bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-red-600/50 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-red-900/10 block"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center text-gray-400 group-hover:bg-red-600/10 group-hover:text-red-500 transition-colors">
                  {client.logo ? (
                    <img src={client.logo} alt={client.name} className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <Building2 size={24} />
                  )}
                </div>
                <div className="px-3 py-1 rounded-full bg-gray-800 text-xs font-medium text-gray-400 border border-gray-700">
                  {client.industry || 'General'}
                </div>
              </div>

              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-red-500 transition-colors">{client.name}</h3>
              
              <div className="space-y-2 mb-6">
                <div className="flex items-center text-sm text-gray-400">
                  <Briefcase size={14} className="mr-2 opacity-50" />
                  <span>{client.brandTone || 'Professional'} Tone</span>
                </div>
                {client.website && (
                  <div className="flex items-center text-sm text-gray-400 truncate">
                    <ExternalLink size={14} className="mr-2 opacity-50" />
                    <span className="truncate">{client.website.replace(/^https?:\/\//, '')}</span>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-gray-800 flex justify-between items-center text-sm">
                <span className="text-gray-500">View Brand Kit</span>
                <span className="text-red-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-[-10px] group-hover:translate-x-0 duration-300">
                  Manage &rarr;
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-gray-900/50 rounded-3xl border border-gray-800 border-dashed">
          <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-600">
            <Users size={32} />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No Clients Found</h3>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            {searchTerm ? `No results for "${searchTerm}"` : "Get started by adding your first client brand kit."}
          </p>
          <Link to="/add-client">
            <Button>
              <Plus size={18} className="mr-2" />
              Add First Client
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default AllClientsView;
