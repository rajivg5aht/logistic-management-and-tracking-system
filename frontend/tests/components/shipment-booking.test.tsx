import type { ReactElement } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test } from "vitest";

import { DeliveryAddressCard } from "@/components/shipment/DeliveryAddressCard";
import { ParcelDetailsCard } from "@/components/shipment/ParcelDetailsCard";
import { PickupAddressCard } from "@/components/shipment/PickupAddressCard";
import { SelectServiceCard } from "@/components/shipment/SelectServiceCard";
import { ShipmentProvider, useShipment } from "@/context/ShipmentContext";

function ShipmentStateProbe() {
  const state = useShipment();

  return (
    <output data-testid="shipment-state">
      {JSON.stringify({
        pickupAddress: state.pickupAddress,
        deliveryAddress: state.deliveryAddress,
        packageDetails: state.packageDetails,
        selectedService: state.selectedService,
        insurance: state.insurance,
        specialHandling: state.specialHandling,
      })}
    </output>
  );
}

function renderBooking(component: ReactElement) {
  return render(
    <ShipmentProvider>
      {component}
      <ShipmentStateProbe />
    </ShipmentProvider>,
  );
}

function shipmentState() {
  return JSON.parse(screen.getByTestId("shipment-state").textContent ?? "{}") as {
    pickupAddress: Record<string, unknown>;
    deliveryAddress: Record<string, unknown>;
    packageDetails: {
      parcelType: string;
      weight: string;
      quantity: number;
      dimensions: Record<string, string>;
    };
    selectedService: string;
    insurance: boolean;
    specialHandling: boolean;
  };
}

describe("shipment booking components", () => {
  test("uses local example names for pickup and delivery", () => {
    renderBooking(
      <>
        <PickupAddressCard />
        <DeliveryAddressCard />
      </>,
    );
    expect(screen.getByPlaceholderText("e.g. Ram Hari")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("e.g. Ram Laxmi")).toBeInTheDocument();
  });

  test("updates pickup contact and street details", async () => {
    renderBooking(<PickupAddressCard />);
    await userEvent.type(screen.getByPlaceholderText("e.g. Ram Hari"), "Ram Bahadur");
    await userEvent.type(screen.getByPlaceholderText("Street name, Building No, Tole"), "Lazimpat 2");
    expect(shipmentState().pickupAddress).toMatchObject({
      fullName: "Ram Bahadur",
      streetAddress: "Lazimpat 2",
    });
  });

  test("keeps only digits in the pickup phone number", async () => {
    renderBooking(<PickupAddressCard />);
    await userEvent.type(screen.getByPlaceholderText("98XXXXXXXX"), "98ab-765432");
    expect(shipmentState().pickupAddress.phoneNumber).toBe("98765432");
  });

  test("selects pickup district and address-book preference", async () => {
    renderBooking(<PickupAddressCard />);
    await userEvent.selectOptions(screen.getByRole("combobox"), "Kathmandu");
    await userEvent.click(screen.getByRole("checkbox", { name: "Save to address book" }));
    expect(shipmentState().pickupAddress).toMatchObject({
      district: "Kathmandu",
      saveToAddressBook: true,
    });
  });

  test("updates recipient and delivery city", async () => {
    renderBooking(<DeliveryAddressCard />);
    await userEvent.type(screen.getByPlaceholderText("e.g. Ram Laxmi"), "Laxmi Gurung");
    await userEvent.type(screen.getByPlaceholderText("e.g. Lalitpur"), "Pokhara");
    expect(shipmentState().deliveryAddress).toMatchObject({
      recipientName: "Laxmi Gurung",
      city: "Pokhara",
    });
  });

  test("updates delivery phone, district, and residence type", async () => {
    renderBooking(<DeliveryAddressCard />);
    await userEvent.type(screen.getByPlaceholderText("98XXXXXXXX"), "9812x34567");
    await userEvent.selectOptions(screen.getByRole("combobox"), "Kaski");
    await userEvent.click(screen.getByRole("checkbox", { name: "Residential address" }));
    expect(shipmentState().deliveryAddress).toMatchObject({
      phoneNumber: "981234567",
      district: "Kaski",
      residentialAddress: true,
    });
  });

  test("changes the parcel type", async () => {
    renderBooking(<ParcelDetailsCard />);
    await userEvent.click(screen.getByText("Fragile / High Value"));
    expect(shipmentState().packageDetails.parcelType).toBe("fragile");
  });

  test("sanitizes decimal package weight", async () => {
    renderBooking(<ParcelDetailsCard />);
    await userEvent.type(screen.getByPlaceholderText("0.00"), "12kg.5.4");
    expect(shipmentState().packageDetails.weight).toBe("12.54");
  });

  test("increments quantity and prevents values below one", async () => {
    renderBooking(<ParcelDetailsCard />);
    const minus = screen.getByRole("button", { name: "-" });
    const plus = screen.getByRole("button", { name: "+" });
    await userEvent.click(minus);
    expect(shipmentState().packageDetails.quantity).toBe(1);
    await userEvent.click(plus);
    expect(shipmentState().packageDetails.quantity).toBe(2);
  });

  test("sanitizes every package dimension", async () => {
    renderBooking(<ParcelDetailsCard />);
    await userEvent.type(screen.getByPlaceholderText("Length"), "10cm");
    await userEvent.type(screen.getByPlaceholderText("Width"), "8.5.2");
    await userEvent.type(screen.getByPlaceholderText("Height"), "6x");
    expect(shipmentState().packageDetails.dimensions).toEqual({
      length: "10",
      width: "8.52",
      height: "6",
    });
  });

  test("defaults to express delivery", () => {
    renderBooking(<SelectServiceCard />);
    expect(shipmentState().selectedService).toBe("express");
    expect(screen.getByText("Popular")).toBeInTheDocument();
  });

  test("switches between standard and overnight service", async () => {
    renderBooking(<SelectServiceCard />);
    await userEvent.click(screen.getByText("Standard Delivery"));
    expect(shipmentState().selectedService).toBe("standard");
    await userEvent.click(screen.getByText("Premium Overnight"));
    expect(shipmentState().selectedService).toBe("overnight");
  });

  test("adds shipment insurance", async () => {
    renderBooking(<SelectServiceCard />);
    await userEvent.click(screen.getByRole("checkbox", { name: /Shipping Insurance/i }));
    expect(shipmentState().insurance).toBe(true);
  });

  test("adds special handling", async () => {
    renderBooking(<SelectServiceCard />);
    await userEvent.click(screen.getByRole("checkbox", { name: /Special Handling/i }));
    expect(shipmentState().specialHandling).toBe(true);
  });
});
