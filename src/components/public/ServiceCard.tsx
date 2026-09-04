import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { AperturePanelArt } from "@/components/icons/DecorativeArt";
import { mediaUrl, formatCurrency } from "@/lib/utils";

export interface ServiceCardData {
  slug: string;
  title: string;
  shortDescription: string;
  imageMediaId?: string;
  startingPrice?: number | null;
  priceLabel?: string;
}

export function ServiceCard({ service, index = 0 }: { service: ServiceCardData; index?: number }) {
  const imageUrl = mediaUrl(service.imageMediaId);
  return (
    <Link
      href={`/services/${service.slug}`}
      className="fade-up group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface transition-shadow hover:shadow-lg"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-secondary/50">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={service.title}
            fill
            sizes="(min-width: 1024px) 320px, 90vw"
            className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <AperturePanelArt className="h-full w-full" />
        )}
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-heading text-xl font-semibold text-foreground">{service.title}</h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{service.shortDescription}</p>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm font-medium text-primary">
            {service.startingPrice
              ? `From ${formatCurrency(service.startingPrice)}`
              : service.priceLabel || "Learn more"}
          </span>
          <ArrowRight className="h-4 w-4 text-primary transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}
