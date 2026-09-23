import {
  describe,
  expect,
  it,
} from "vitest";

import {
  ApiClient,
} from "@/core/http/ApiClient";

describe(
  "ApiClient",
  () => {
    it(
      "uses the injected fetcher",
      async () => {
        let url = "";

        const client =
          new ApiClient(
            "https://api.example.com",
            async (
              requestedUrl
            ) => {
              url = requestedUrl;

              return new Response(
                JSON.stringify({
                  ok: true,
                }),
                {
                  status: 200,
                }
              );
            }
          );

        const result =
          await client.get<{
            ok: boolean;
          }>("/boards/");

        expect(url).toBe(
          "https://api.example.com/boards/"
        );

        expect(result).toEqual({
          ok: true,
        });
      }
    );

    it(
      "throws ApiError for HTTP errors",
      async () => {
        const client =
          new ApiClient(
            "https://api.example.com",
            async () =>
              new Response(
                JSON.stringify({
                  detail:
                    "Invalid request",
                }),
                {
                  status: 422,
                }
              )
          );

        await expect(
          client.get(
            "/invalid/"
          )
        ).rejects.toMatchObject({
          name: "ApiError",
          status: 422,
          message:
            "Invalid request",
        });
      }
    );

    it("shows the first backend validation error", async () => {
      const client = new ApiClient("https://api.example.com", async () =>
        new Response(JSON.stringify({ errors: { password: ["Password is too short."] } }), { status: 400 })
      );

      await expect(client.post("/auth/users/", {})).rejects.toMatchObject({
        name: "ApiError",
        message: "password: Password is too short.",
      });
    });
  }
);
