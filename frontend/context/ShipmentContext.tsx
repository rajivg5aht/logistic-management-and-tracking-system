"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import type { ServiceType } from "@/lib/api/shipment.api";

export const NEPAL_DISTRICTS = [
  "Achham", "Arghakhanchi", "Baglung", "Baitadi", "Bajhang", "Bajura", "Banke",
  "Bara", "Bardiya", "Bhaktapur", "Bhojpur", "Chitwan", "Dadeldhura", "Dailekh",
  "Dang", "Darchula", "Dhading", "Dhankuta", "Dhanusha", "Dolakha", "Dolpa",
  "Doti", "Gorkha", "Gulmi", "Humla", "Ilam", "Jajarkot", "Jhapa", "Jumla",
  "Kailali", "Kalikot", "Kanchanpur", "Kapilvastu", "Kaski", "Kathmandu",
  "Kavrepalanchok", "Khotang", "Lalitpur", "Lamjung", "Mahottari", "Makwanpur",
  "Manang", "Morang", "Mugu", "Mustang", "Myagdi", "Nawalparasi East",
  "Nawalparasi West", "Nuwakot", "Okhaldhunga", "Palpa", "Panchthar", "Parbat",
  "Parsa", "Pyuthan", "Ramechhap", "Rasuwa", "Rautahat", "Rolpa", "Rukum East",
  "Rukum West", "Rupandehi", "Salyan", "Sankhuwasabha", "Saptari", "Sarlahi",
  "Sindhuli", "Sindhupalchok", "Siraha", "Solukhumbu", "Sunsari", "Surkhet",
  "Syangja", "Tanahun", "Taplejung", "Terhathum", "Udayapur",
] as const;

export interface PickupAddress {
  fullName: string;
  phoneNumber: string;
  streetAddress: string;
  city: string;
  district: string;
  saveToAddressBook: boolean;
}

export interface DeliveryAddress {
  recipientName: string;
  phoneNumber: string;
  streetAddress: string;
  city: string;
  district: string;
  residentialAddress: boolean;
}

export interface PackageDetails {
  parcelType: "standard" | "fragile" | "pallet";
  weight: string;
  quantity: number;
  dimensions: {
    length: string;
    width: string;
    height: string;
  };
}

export type { ServiceType } from "@/lib/api/shipment.api";

interface ShipmentContextType {
  pickupAddress: PickupAddress;
  setPickupAddress: (data: PickupAddress) => void;
  updatePickupField: <K extends keyof PickupAddress>(
    field: K,
    value: PickupAddress[K],
  ) => void;

  deliveryAddress: DeliveryAddress;
  setDeliveryAddress: (data: DeliveryAddress) => void;
  updateDeliveryField: <K extends keyof DeliveryAddress>(
    field: K,
    value: DeliveryAddress[K],
  ) => void;

  packageDetails: PackageDetails;
  setPackageDetails: (data: PackageDetails) => void;
  updatePackageField: <K extends keyof Omit<PackageDetails, "dimensions">>(
    field: K,
    value: Omit<PackageDetails, "dimensions">[K],
  ) => void;
  updateDimension: (field: "length" | "width" | "height", value: string) => void;

  selectedService: ServiceType;
  setSelectedService: (service: ServiceType) => void;
  insurance: boolean;
  setInsurance: (val: boolean) => void;
  specialHandling: boolean;
  setSpecialHandling: (val: boolean) => void;
}

const ShipmentContext = createContext<ShipmentContextType | undefined>(undefined);

export function ShipmentProvider({ children }: { children: ReactNode }) {
  const [pickupAddress, setPickupAddress] = useState<PickupAddress>({
    fullName: "",
    phoneNumber: "",
    streetAddress: "",
    city: "",
    district: "",
    saveToAddressBook: false,
  });

  const [deliveryAddress, setDeliveryAddress] = useState<DeliveryAddress>({
    recipientName: "",
    phoneNumber: "",
    streetAddress: "",
    city: "",
    district: "",
    residentialAddress: false,
  });

  const [packageDetails, setPackageDetails] = useState<PackageDetails>({
    parcelType: "standard",
    weight: "",
    quantity: 1,
    dimensions: {
      length: "",
      width: "",
      height: "",
    },
  });

  const [selectedService, setSelectedService] = useState<ServiceType>("express");
  const [insurance, setInsurance] = useState(false);
  const [specialHandling, setSpecialHandling] = useState(false);

  const updatePickupField = <K extends keyof PickupAddress,>(
    field: K,
    value: PickupAddress[K],
  ) => {
    setPickupAddress((prev) => ({ ...prev, [field]: value }));
  };

  const updateDeliveryField = <K extends keyof DeliveryAddress,>(
    field: K,
    value: DeliveryAddress[K],
  ) => {
    setDeliveryAddress((prev) => ({ ...prev, [field]: value }));
  };

  const updatePackageField = <
    K extends keyof Omit<PackageDetails, "dimensions">,
  >(
    field: K,
    value: Omit<PackageDetails, "dimensions">[K],
  ) => {
    setPackageDetails((prev) => ({ ...prev, [field]: value }));
  };

  const updateDimension = (field: "length" | "width" | "height", value: string) => {
    setPackageDetails((prev) => ({
      ...prev,
      dimensions: { ...prev.dimensions, [field]: value },
    }));
  };

  return (
    <ShipmentContext.Provider
      value={{
        pickupAddress,
        setPickupAddress,
        updatePickupField,
        deliveryAddress,
        setDeliveryAddress,
        updateDeliveryField,
        packageDetails,
        setPackageDetails,
        updatePackageField,
        updateDimension,
        selectedService,
        setSelectedService,
        insurance,
        setInsurance,
        specialHandling,
        setSpecialHandling,
      }}
    >
      {children}
    </ShipmentContext.Provider>
  );
}

export function useShipment() {
  const context = useContext(ShipmentContext);
  if (!context) {
    throw new Error("useShipment must be used within a ShipmentProvider");
  }
  return context;
}
