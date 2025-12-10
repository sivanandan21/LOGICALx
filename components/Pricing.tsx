import React from 'react';
import { Check, Crown, Zap, Shield, Star } from 'lucide-react';
import { Button } from './Button';

interface PricingProps {
  currentPlan?: 'free' | 'pro_monthly' | 'pro_yearly';
  onSubscribe: (plan: 'free' | 'pro_monthly' | 'pro_yearly') => void;
}

export const Pricing: React.FC<PricingProps> = ({ currentPlan = 'free', onSubscribe }) => {
  const plans = [
    {
      id: 'free',
      title: 'Free',
      price: '₹0',
      period: 'Forever',
      description: 'Perfect for getting started',
      features: ['Beginner questions only', 'Standard Daily Tasks', 'Community Leaderboard'],
      icon: <Shield className="w-8 h-8 text-slate-400" />,
      color: 'border-slate-700',
      btnVariant: 'outline',
      highlight: false,
      bg: undefined
    },
    {
      id: 'pro_monthly',
      title: 'Pro Monthly',
      price: '₹99',
      period: '/ month',
      description: 'Supercharge your logic',
      features: ['All Levels (Beginner, Int, Expert)', 'XP Boost (1.5x)', 'Unlock Exclusive Badges', 'Detailed Explanations'],
      icon: <Zap className="w-8 h-8 text-yellow-400" />,
      color: 'border-primary',
      bg: 'bg-primary/10',
      btnVariant: 'primary',
      highlight: true
    },
    {
      id: 'pro_yearly',
      title: 'Pro Yearly',
      price: '₹499',
      period: '/ year',
      description: 'Maximum value for serious solvers',
      features: ['All Pro Monthly features', 'Ad-Free Experience', 'Exclusive Puzzle Sets', 'Priority Support', 'Early Access to New Features'],
      icon: <Crown className="w-8 h-8 text-emerald-400" />,
      color: 'border-emerald-500',
      bg: 'bg-emerald-500/10',
      btnVariant: 'secondary',
      highlight: false
    }
  ] as const;

  return (
    <div className="max-w-6xl mx-auto pb-20 md:pb-0 animate-fade-in">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Choose Your Path</h2>
        <p className="text-slate-400 max-w-2xl mx-auto">Unlock your full potential with our Pro plans. Get access to expert-level puzzles and track your growth faster.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => {
            const isCurrent = currentPlan === plan.id;
            return (
                <div 
                    key={plan.id} 
                    className={`relative bg-surface rounded-2xl p-6 border-2 flex flex-col transition-all hover:-translate-y-2 duration-300 ${plan.color} ${plan.bg || ''} ${plan.highlight ? 'shadow-xl shadow-primary/20' : ''}`}
                >
                    {plan.highlight && (
                        <div className="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-lg">
                            MOST POPULAR
                        </div>
                    )}
                    
                    <div className="mb-6">
                        <div className="mb-4 inline-block p-3 rounded-xl bg-background border border-slate-700">
                            {plan.icon}
                        </div>
                        <h3 className="text-xl font-bold text-white">{plan.title}</h3>
                        <div className="mt-2 flex items-baseline text-white">
                            <span className="text-3xl font-bold tracking-tight">{plan.price}</span>
                            <span className="ml-1 text-slate-400 text-sm font-medium">{plan.period}</span>
                        </div>
                        <p className="mt-4 text-sm text-slate-300">{plan.description}</p>
                    </div>

                    <div className="flex-1 mb-8">
                        <ul className="space-y-4">
                            {plan.features.map((feature, index) => (
                                <li key={index} className="flex items-start">
                                    <Check className="h-5 w-5 text-emerald-500 shrink-0 mr-3" />
                                    <span className="text-slate-300 text-sm">{feature}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <Button 
                        fullWidth 
                        variant={isCurrent ? 'outline' : (plan.btnVariant as any)}
                        disabled={isCurrent}
                        onClick={() => onSubscribe(plan.id as any)}
                    >
                        {isCurrent ? 'Current Plan' : plan.id === 'free' ? 'Downgrade' : 'Upgrade Now'}
                    </Button>
                </div>
            );
        })}
      </div>

      <div className="mt-12 p-6 bg-surface/50 border border-slate-800 rounded-xl text-center">
        <div className="flex justify-center mb-4">
            <Star className="text-yellow-500 fill-yellow-500 mx-1" />
            <Star className="text-yellow-500 fill-yellow-500 mx-1" />
            <Star className="text-yellow-500 fill-yellow-500 mx-1" />
            <Star className="text-yellow-500 fill-yellow-500 mx-1" />
            <Star className="text-yellow-500 fill-yellow-500 mx-1" />
        </div>
        <p className="text-slate-300 italic">"The expert puzzles in the Pro plan really helped me ace my technical interviews. Worth every rupee!"</p>
        <p className="text-slate-500 text-sm mt-2">- Priya S., Senior Engineer</p>
      </div>
    </div>
  );
};