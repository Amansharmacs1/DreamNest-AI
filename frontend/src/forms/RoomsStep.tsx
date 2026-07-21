import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useWizardStore } from '@/store/wizardStore';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const schema = z.object({
  bedrooms: z.number().min(0),
  bathrooms: z.number().min(0),
  livingRooms: z.number().min(0),
  kitchen: z.number().min(0),
  diningRoom: z.number().min(0),
  studyRoom: z.number().min(0),
  office: z.number().min(0),
  prayerRoom: z.number().min(0),
  storeRoom: z.number().min(0),
  laundry: z.number().min(0),
  balcony: z.number().min(0),
  terrace: z.number().min(0),
});

type FormData = z.infer<typeof schema>;

export function RoomsStep({ onNext }: { onNext: () => void }) {
  const { preferences, updatePreferences } = useWizardStore();
  const { register, handleSubmit } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: preferences.rooms,
  });

  const onSubmit = (data: FormData) => {
    updatePreferences('rooms', data);
    onNext();
  };

  const fields = ['bedrooms', 'bathrooms', 'livingRooms', 'kitchen', 'diningRoom', 'studyRoom', 'office', 'prayerRoom', 'storeRoom', 'laundry', 'balcony', 'terrace'];

  return (
    <form id="rooms-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <h2 className="text-2xl font-bold mb-4">Rooms Requirement</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {fields.map((field) => (
          <div key={field} className="space-y-2">
            <Label className="capitalize">{field.replace(/([A-Z])/g, ' $1').trim()}</Label>
            <Input type="number" {...register(field as keyof FormData, { valueAsNumber: true })} />
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-4">
        <button type="submit" className="h-10 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md text-sm font-medium">
          Next Step
        </button>
      </div>
    </form>
  );
}
