// Lokasi: frontend/components/AdminPageHeader.tsx
import { ReactNode } from 'react';

type Props = {
  title: string;
  description: string;
  actionButton?: ReactNode; // Tombol bersifat opsional
};

export default function AdminPageHeader({ title, description, actionButton }: Props) {
  return (
    <div className="flex justify-between items-center mb-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
        <p className="mt-2 text-gray-600">{description}</p>
      </div>
      {actionButton && <div>{actionButton}</div>}
    </div>
  );
}