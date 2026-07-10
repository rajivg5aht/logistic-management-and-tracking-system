import {
  DriverLocationModel,
  IDriverLocation,
} from "../models/driverLocation.model";

export interface DriverLocationInput {
  driverId: string;
  latitude: number;
  longitude: number;
  accuracy: number | null;
  speed: number | null;
  heading: number | null;
  isLive?: boolean;
  startedAt?: Date | null;
  stoppedAt?: Date | null;
  updatedAt: Date;
}

export interface IDriverLocationRepository {
  getByShipment(shipmentId: string): Promise<IDriverLocation | null>;
  upsert(
    shipmentId: string,
    data: DriverLocationInput,
  ): Promise<IDriverLocation>;
  setLiveStatus(
    shipmentId: string,
    driverId: string,
    isLive: boolean,
    at: Date,
  ): Promise<IDriverLocation | null>;
}

export class DriverLocationMongoRepository
  implements IDriverLocationRepository
{
  async getByShipment(shipmentId: string): Promise<IDriverLocation | null> {
    return DriverLocationModel.findOne({ shipmentId });
  }

  // Keeps a single latest-location document per shipment.
  async upsert(
    shipmentId: string,
    data: DriverLocationInput,
  ): Promise<IDriverLocation> {
    return DriverLocationModel.findOneAndUpdate(
      { shipmentId },
      { ...data, shipmentId },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }

  async setLiveStatus(
    shipmentId: string,
    driverId: string,
    isLive: boolean,
    at: Date,
  ): Promise<IDriverLocation | null> {
    return DriverLocationModel.findOneAndUpdate(
      { shipmentId, driverId },
      isLive
        ? { isLive: true, startedAt: at, stoppedAt: null }
        : { isLive: false, stoppedAt: at },
      { new: true },
    );
  }
}
