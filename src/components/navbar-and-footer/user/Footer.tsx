import { Link } from "react-router-dom";
import { socials, suportLinks, contacts, aboutLinks } from "@/lib/constants";
export function Footer() {
  return (
    <footer className="bg-white text-gray-800 ">
      <div className="bg-[#007E42] w-full min-h-12 text-center flex items-center justify-center px-4 py-2">
        <span className="text-white font-bold text-xs sm:text-sm md:text-base">
          BÁN HÀNG: 6:00 đến 22:00 - KHIẾU NẠI: 8:00 đến 22:00 - CAM KẾT: Giao hàng trong thời gian 2h - HOTLINE: 0386.740.043
        </span>
      </div>
      <div className="container mx-auto px-4 pb-5 pt-3">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-xl font-bold mb-4">Vật Tư Nông Nghiệp</h3>
            <p className="text-sm opacity-90 mb-4">
              Cửa hàng vật tư nông nghiệp hàng đầu Việt Nam, mang đến cho quý khách hàng những sản phẩm chất lượng cao.
            </p>
            <div className="flex gap-3">
              {socials.map(({ label, to, Icon }) => (
                <Link
                  key={label}
                  to={to}
                  aria-label={label}
                  className="h-10 w-10 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center transition-colors"
                >
                  <Icon className="h-5 w-5" />
                </Link>
              ))}
            </div>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-bold mb-4">Hỗ trợ khách hàng</h4>
            <ul className="space-y-2 text-sm opacity-90">
              {suportLinks.map(({ label, to }) => (
                <li key={label}>
                  <Link to={to} className="hover:underline">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About */}
          <div>
            <h4 className="font-bold mb-4">Về chúng tôi</h4>
            <ul className="space-y-2 text-sm opacity-90">
              {aboutLinks.map(({ label, to }) => (
                <li key={label}>
                  <Link to={to} className="hover:underline">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold mb-4">Liên hệ</h4>
            <ul className="space-y-3 text-sm opacity-90">
              {contacts.map(({ title, value, Icon }) => (
                <li key={title} className="flex items-start gap-2">
                  <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium">{title}</div>
                    <div>{value}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/10 mt-5 text-center text-sm opacity-75">
          <p>© 2025 Vật Tư Nông Nghiệp. Tất cả quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  );
}
