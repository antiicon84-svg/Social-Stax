import React from 'react';
import { Link } from 'react-router-dom';
import { Client } from '../types';

interface NavbarProps {
  clients: Client[];
}

const Navbar: React.FC<NavbarProps> = ({ clients }) => {
  return (
    <nav className="w-full md:w-64 bg-gray-950 text-white flex flex-col h-screen border-r border-gray-800">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-red-600">Social StaX</h1>
      </div>
      
      <div className="flex-1 overflow-y-auto px-4">
        <div className="mb-8">
          <Link to="/" className="block py-2 px-4 hover:bg-gray-800 rounded transition-colors">Dashboard</Link>
          <Link to="/add-client" className="block py-2 px-4 hover:bg-gray-800 rounded transition-colors">Add Client</Link>
          <Link to="/templates" className="block py-2 px-4 hover:bg-gray-800 rounded transition-colors">Templates</Link>
          <Link to="/content-lab" className="block py-2 px-4 hover:bg-gray-800 rounded transition-colors">Content Lab</Link>
          <Link to="/downloads" className="block py-2 px-4 hover:bg-gray-800 rounded transition-colors">Downloads</Link>
          <Link to="/prompt-guide" className="block py-2 px-4 hover:bg-gray-800 rounded transition-colors">Prompt Guide</Link>
        </div>

        <div>
          <h2 className="text-xs uppercase text-gray-500 font-semibold px-4 mb-2">Clients</h2>
          {clients && clients.map(client => (
            <Link 
              key={client.id} 
              to={`/client/${client.id}`}
              className="block py-2 px-4 hover:bg-gray-800 rounded transition-colors text-sm"
            >
              {client.name}
            </Link>
          ))}
        </div>
      </div>

      <div className="p-4 mt-auto border-t border-gray-800">
        <Link to="/billing" className="block py-2 px-4 hover:bg-gray-800 rounded transition-colors text-sm">
          Billing & Subscription
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
