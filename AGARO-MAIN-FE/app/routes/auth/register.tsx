import type { Route } from "./+types/register";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Register" },
    { name: "description", content: "Register to your account" },
  ];
}

export default function Register() {
  return <div>Register</div>;
}
