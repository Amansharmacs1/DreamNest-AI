import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useWizardStore } from '@/store/wizardStore';
import { Label } from '@/components/ui/label';

const schema = z.object({
  vastuRequired: z.boolean(),
  wheelchairFriendly: z.boolean(),
  petFriendly: z.boolean(),
  naturalLightingPriority: z.boolean(),
  crossVentilationPriority: z.boolean(),
  futureExpansion: z.boolean(),
  smartHomeReady: z.boolean(),
  additionalNotes: z.string(),
});

type FormData = z.infer<typeof schema>;

export function PreferencesStep({ onNext, loading }: { onNext: () => void, loading: boolean }) {
  const { preferences, updatePreferences } = useWizardStore();
  const { register, handleSubmit } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: preferences.preferences,
  });

  const onSubmit = (data: FormData) => {
    updatePreferences('preferences', data);
    onNext();
  };

  const checkboxes = ['vastuRequired', 'wheelchairFriendly', 'petFriendly', 'naturalLightingPriority', 'crossVentilationPriority', 'futureExpansion', 'smartHomeReady'];

  return (
    <form id="preferences-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <h2 className="text-2xl font-bold mb-4">Final Preferences</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {checkboxes.map((field) => (
          <div key={field} className="flex items-center space-x-2">
            <input type="checkbox" id={field} {...register(field as keyof FormData)} className="w-4 h-4 text-primary" />
            <Label htmlFor={field} className="capitalize">{field.replace(/([A-Z])/g, ' $1').trim()}</Label>
          </div>
        ))}
      </div>

      <div className="space-y-2 mt-6">
        <Label>Additional Notes</Label>
        <textarea 
          {...register('additionalNotes')} 
          className="w-full h-24 rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
          placeholder="Any other details for the AI..."
        />
      </div>

      <div className="flex justify-end pt-4">
        <button disabled={loading} type="submit" className="h-10 px-6 py-2 bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-md text-sm font-bold shadow-lg transition-transform hover:scale-105 disabled:opacity-50">
          {loading ? 'Generating Layout...' : 'Generate Layout ✨'}
        </button>
      </div>
    </form>
  );
}
