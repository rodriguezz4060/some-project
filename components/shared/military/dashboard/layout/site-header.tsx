import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

interface Props {
  title?: string;
  subtitle?: string;
}

export function SiteHeader({ title = "Особовий склад", subtitle }: Props) {
  return (
    <header className="flex mt-5 h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />

        <h1 className="text-base font-medium">{title}</h1>

        {subtitle && (
          <div className="ml-auto flex items-center gap-2">
            <div className="text-sm text-muted-foreground">{subtitle}</div>
          </div>
        )}
      </div>
    </header>
  );
}
