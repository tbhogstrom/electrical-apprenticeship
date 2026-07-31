import Link from "next/link";

const links = [
  { href: "/", label: "Home" },
  { href: "/timeline", label: "Timeline" },
  { href: "/projects", label: "Projects" },
  { href: "/gallery", label: "Gallery" },
  { href: "/math", label: "Math" },
  { href: "/about", label: "About" },
];

export function NavBar() {
  return (
    <header className="border-b border-gray-200 dark:border-gray-800">
      <nav className="mx-auto flex max-w-2xl gap-6 px-4 py-4">
        {links.map((link) => (
          <Link key={link.href} className="underline" href={link.href}>
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
