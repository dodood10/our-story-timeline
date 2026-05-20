import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/r/$code")({
  beforeLoad: ({ params }) => {
    const code = params.code.trim().toUpperCase();
    throw redirect({ to: "/", search: { ref: code } });
  },
  component: () => null,
});
