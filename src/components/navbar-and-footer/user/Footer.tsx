import { Link } from "react-router-dom";
import { socials, collaborates, suportLinks, contacts, aboutLinks } from "@/lib/constants";
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
            <h3 className="text-xl font-bold mb-4">Bách Hóa Không Xanh</h3>
            <p className="text-sm opacity-90 mb-4">
              Chuỗi cửa hàng thực phẩm hàng đầu Việt Nam, mang đến cho quý khách hàng những sản phẩm tươi ngon mỗi ngày.
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
        <div className="py-5 lg:py-0">
          <span className=" text-sm opacity-90">WebSite cùng tập đoàn</span>
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-8">
            {collaborates.map(({ label, to, image }) => (
              <Link
                key={label}
                to={to}
                aria-label={label}
                className="inline-flex px-3 py-2 w-full items-center transition justify-between "
              >
                <img src={image} alt="label" className="h-8 w-22" />
              </Link>
            ))}
          </div>
        </div>
        <div className="border-t border-primary-foreground/10 mt-5 text-center text-sm opacity-75">
          <p>© 2025 Bách Hóa Xanh. Tất cả quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  );
}
