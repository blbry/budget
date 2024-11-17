import { useEffect, useState } from 'react';
import { Vehicle } from '@/shared/types';
import { Button } from '@/renderer/components/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/renderer/components/table';
import VehicleDialog from '@/renderer/components/VehicleDialog';

function getOrdinalSuffix(n: number): string {
  if (n >= 11 && n <= 13) {
    return 'th';
  }
  switch (n % 10) {
    case 1:
      return 'st';
    case 2:
      return 'nd';
    case 3:
      return 'rd';
    default:
      return 'th';
  }
}

export default function Vehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  const loadVehicles = async () => {
    const vehs = await window.electron.vehicles.getAll();
    setVehicles(vehs);
  };

  useEffect(() => {
    loadVehicles();
  }, []);

  const handleEdit = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      await window.electron.vehicles.delete(id);
      loadVehicles();
    }
  };

  const handleDialogClose = () => {
    setSelectedVehicle(null);
    setIsDialogOpen(false);
    loadVehicles();
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Vehicles</h1>
        <Button onClick={() => setIsDialogOpen(true)}>
          Add Vehicle
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Value</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead>Remaining</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vehicles.map((vehicle) => (
            <TableRow key={vehicle.id}>
              <TableCell>{vehicle.name}</TableCell>
              <TableCell className="capitalize">{vehicle.ownership_type}</TableCell>
              <TableCell>
                {vehicle.value ? `$${vehicle.value.toFixed(2)}` : '-'}
              </TableCell>
              <TableCell>
                {vehicle.payment_amount && vehicle.payment_date
                  ? `$${vehicle.payment_amount.toFixed(2)} (${vehicle.payment_date}${getOrdinalSuffix(vehicle.payment_date)})`
                  : '-'}
              </TableCell>
              <TableCell>
                {vehicle.remaining_payments ?? '-'}
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(vehicle)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(vehicle.id)}
                  >
                    Delete
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <VehicleDialog
        open={isDialogOpen}
        onClose={handleDialogClose}
        vehicle={selectedVehicle || undefined}
        onSubmit={async (data) => {
          if (selectedVehicle) {
            await window.electron.vehicles.update(selectedVehicle.id, data);
          } else {
            await window.electron.vehicles.create(data);
          }
        }}
      />
    </div>
  );
}
