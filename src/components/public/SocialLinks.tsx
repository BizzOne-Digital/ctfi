import { InstagramIcon, FacebookIcon, XIcon, TiktokIcon } from "@/components/icons/SocialIcons";

export function SocialLinks({
  instagramUrl,
  facebookUrl,
  xUrl,
  tiktokUrl,
  className,
}: {
  instagramUrl?: string;
  facebookUrl?: string;
  xUrl?: string;
  tiktokUrl?: string;
  className?: string;
}) {
  const links = [
    { href: instagramUrl, label: "Follow on Instagram", Icon: InstagramIcon },
    { href: facebookUrl, label: "Follow on Facebook", Icon: FacebookIcon },
    { href: xUrl, label: "Follow on X", Icon: XIcon },
    { href: tiktokUrl, label: "Follow on TikTok", Icon: TiktokIcon },
  ].filter((l) => l.href);

  if (links.length === 0) return null;

  return (
    <div className={className}>
      <div className="flex justify-center gap-4">
        {links.map(({ href, label, Icon }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            className="flex h-14 w-14 items-center justify-center rounded-full border border-border text-foreground transition-all hover:-translate-y-0.5 hover:border-primary hover:text-primary hover:shadow-md"
          >
            <Icon className="h-6 w-6" />
          </a>
        ))}
      </div>
    </div>
  );
}
