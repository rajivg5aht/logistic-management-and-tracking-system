"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export interface PickupAddress {
  fullName: string;
  streetAddress: string;
  city: string;
  postalCode: string;
  country: string;
  saveToAddressBook: boolean;
}

export interface DeliveryAddress {
  recipientName: string;
  streetAddress: string;
  city: string;
  postalCode: string;
  country: string;
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

export type ServiceType = "standard" | "express" | "overnight";

interface ShipmentContextType {
  pickupAddress: PickupAddress;
  setPickupAddress: (data: PickupAddress) => void;
  updatePickupField: (field: string, value: string | boolean) => void;

  deliveryAddress: DeliveryAddress;
  setDeliveryAddress: (data: DeliveryAddress) => void;
  updateDeliveryField: (field: string, value: string | boolean) => void;

  packageDetails: PackageDetails;
  setPackageDetails: (data: PackageDetails) => void;
  updatePackageField: (field: string, value: string | number) => void;
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
    streetAddress: "",
    city: "",
    postalCode: "",
    country: "United States",
    saveToAddressBook: false,
  });

  const [deliveryAddress, setDeliveryAddress] = useState<DeliveryAddress>({
    recipientName: "",
    streetAddress: "",
    city: "",
    postalCode: "",
    country: "United States",
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

  const updatePickupField = (field: string, value: string | boolean) => {
    setPickupAddress((prev) => ({ ...prev, [field]: value }));
  };

  const updateDeliveryField = (field: string, value: string | boolean) => {
    setDeliveryAddress((prev) => ({ ...prev, [field]: value }));
  };

  const updatePackageField = (field: string, value: string | number) => {
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
