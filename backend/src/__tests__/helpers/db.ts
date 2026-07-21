import { UserModel } from "../../models/user.model";
import { VehicleModel } from "../../models/vehicle.model";
import { ShipmentModel } from "../../models/shipment.model";
import { PaymentModel } from "../../models/payment.model";
import { InquiryModel } from "../../models/inquiry.model";
import { DriverLocationModel } from "../../models/driverLocation.model";
import { VehicleIncidentModel } from "../../models/vehicleIncident.model";
import { VehicleFuelExpenseModel } from "../../models/vehicleFuelExpense.model";
import { AnnouncementModel } from "../../models/announcement.model";

export async function clearDatabase(): Promise<void> {
  await Promise.all([
    UserModel.deleteMany({}),
    VehicleModel.deleteMany({}),
    ShipmentModel.deleteMany({}),
    PaymentModel.deleteMany({}),
    InquiryModel.deleteMany({}),
    DriverLocationModel.deleteMany({}),
    VehicleIncidentModel.deleteMany({}),
    VehicleFuelExpenseModel.deleteMany({}),
    AnnouncementModel.deleteMany({}),
  ]);
}
