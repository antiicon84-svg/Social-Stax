import { useAuth } from '@/context/AuthContext';
import { getCurrentUser } from '~/services/authService';

const BillingView: React.FC = () => {
  const { currentUser } = useAuth();
  const usage = currentUser?.profile?.usage || {
    aiAnalysis: 0,
    contentGenerations: 0,
    imageGenerations: 0,
    apiCalls: 0
  };

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto w-full text-white">
      <h1 className="text-3xl font-bold mb-2 text-red-600">Subscription & Billing</h1>
      <p className="text-gray-400 mb-8">Manage your plan and view your billing history.</p>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div className="bg-gray-900 p-8 rounded-2xl border border-red-900/30">
          <h2 className="text-sm font-bold text-red-500 uppercase tracking-widest mb-4">Current Plan</h2>
          <div className="text-4xl font-bold mb-2">{currentUser?.profile?.planTier || 'Free'} Plan</div>
          <div className="text-gray-400 mb-6">{currentUser?.profile?.planTier === 'pro' ? '$49 / month' : 'Free Forever'}</div>
          <ul className="space-y-3 text-sm text-gray-300 mb-8">
            <li className="flex items-center">
              <span className="text-red-500 mr-2">✓</span> {currentUser?.profile?.planTier === 'pro' ? 'Unlimited' : 'Limited'} AI Generations
            </li>
            <li className="flex items-center">
              <span className="text-red-500 mr-2">✓</span> {currentUser?.profile?.planTier === 'pro' ? '10' : '1'} Social Profiles
            </li>
            <li className="flex items-center">
              <span className="text-red-500 mr-2">✓</span> Advanced Analytics
            </li>
          </ul>
          <button className="w-full py-3 bg-red-600 hover:bg-red-700 rounded-lg font-bold transition-colors">
            Manage Subscription
          </button>
        </div>

        <div className="bg-gray-900 p-8 rounded-2xl border border-gray-800">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Usage This Month</h2>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>AI Generations</span>
                <span>{usage.contentGenerations} / {user?.profile?.planTier === 'pro' ? '∞' : '50'}</span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-600"
                  style={{ width: `${Math.min((usage.contentGenerations / (user?.profile?.planTier === 'pro' ? 1000 : 50)) * 100, 100)}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Image Generations</span>
                <span>{usage.imageGenerations || 0} / {user?.profile?.planTier === 'pro' ? '∞' : '10'}</span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-600"
                  style={{ width: `${Math.min(((usage.imageGenerations || 0) / (user?.profile?.planTier === 'pro' ? 500 : 10)) * 100, 100)}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Credits Used</span>
                <span>{user?.profile?.creditsUsed || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingView;
