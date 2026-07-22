import request from "supertest";
import app from "../../app";
import { clearDatabase } from "../helpers/db";
import {
  authHeader,
  seedAdmin,
  seedCustomer,
  seedDriver,
  type SeededUser,
} from "../helpers/factories";

describe("Integration: Announcement Routes", () => {
  let admin: SeededUser;
  let customer: SeededUser;
  let driver: SeededUser;

  beforeAll(async () => {
    await clearDatabase();
    [admin, customer, driver] = await Promise.all([
      seedAdmin(),
      seedCustomer(),
      seedDriver(),
    ]);
  });

  test("only an admin can publish an announcement", async () => {
    const denied = await request(app)
      .post("/api/v1/admin/announcements")
      .set(authHeader(customer.token))
      .send({
        title: "Customer attempt",
        message: "Customers must not be able to publish announcements.",
        audience: "customer",
      });
    expect(denied.statusCode).toBe(403);

    const published = await request(app)
      .post("/api/v1/admin/announcements")
      .set(authHeader(admin.token))
      .send({
        title: "Customer service update",
        message: "Customer deliveries may take longer than usual today.",
        audience: "customer",
      });
    expect(published.statusCode).toBe(201);
    expect(published.body.data.audience).toBe("customer");
  });

  test("customers and drivers only receive announcements for their audience", async () => {
    await request(app)
      .post("/api/v1/admin/announcements")
      .set(authHeader(admin.token))
      .send({
        title: "Driver route update",
        message: "Drivers should review the updated route guidance.",
        audience: "driver",
      });

    await request(app)
      .post("/api/v1/admin/announcements")
      .set(authHeader(admin.token))
      .send({
        title: "Platform maintenance",
        message: "The platform will be briefly unavailable this evening.",
        audience: "all",
      });

    const customerResponse = await request(app)
      .get("/api/v1/announcements")
      .set(authHeader(customer.token));
    const driverResponse = await request(app)
      .get("/api/v1/announcements")
      .set(authHeader(driver.token));

    expect(customerResponse.statusCode).toBe(200);
    expect(
      customerResponse.body.data.map((item: { audience: string }) => item.audience),
    ).toEqual(expect.arrayContaining(["customer", "all"]));
    expect(
      customerResponse.body.data.some(
        (item: { audience: string }) => item.audience === "driver",
      ),
    ).toBe(false);

    expect(driverResponse.statusCode).toBe(200);
    expect(
      driverResponse.body.data.map((item: { audience: string }) => item.audience),
    ).toEqual(expect.arrayContaining(["driver", "all"]));
    expect(
      driverResponse.body.data.some(
        (item: { audience: string }) => item.audience === "customer",
      ),
    ).toBe(false);
  });

  test("recipient routes expose no write or reply endpoint", async () => {
    const response = await request(app)
      .post("/api/v1/announcements")
      .set(authHeader(driver.token))
      .send({ message: "reply" });

    expect(response.statusCode).toBe(404);
  });
});
