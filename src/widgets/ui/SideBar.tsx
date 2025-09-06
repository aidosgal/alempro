import { FiBriefcase, FiHome, FiInbox, FiMail, FiTrello } from "react-icons/fi";
import { usePathname } from "next/navigation";

type Props = {
  onClose?: () => void;
  isClosed?: boolean;
}

type Link = {
  label: string;
  icon: React.ReactNode;
  url: string;
}

const SideBar: React.FC<Props> = ({ onClose, isClosed }) => {
  const pathname = usePathname();
  
  const links: Link[] = [
    { label: "Главная", icon: <FiHome size={24} />, url: "/" },
    { label: "Вакансии", icon: <FiBriefcase size={24} />, url: "/vacancy" },
    { label: "Чат", icon: <FiMail size={24} />, url: "/chat" },
    { label: "Услуги", icon: <FiInbox size={24} />, url: "/service" },
    { label: "Заказы", icon: <FiTrello size={24} />, url: "/order" },
  ];

  return (
    <div 
      className={`flex flex-col border-r border-gray-200 p-4 ${isClosed ? 'w-auto items-center' : 'w-[15%]'} transition-all duration-300`}
    >
      <button 
        onClick={onClose}
        className={`relative w-8 h-8 mx-2 flex flex-col justify-center items-center focus:outline-none cursor-pointer`}
        aria-label={!isClosed ? "Open menu" : "Close menu"}
      >
        <span 
          className={`block w-6 h-0.5 bg-gray-700 absolute transform transition-all duration-300 ease-in-out ${
            !isClosed ? 'rotate-45' : 'rotate-0 -translate-y-1.5'
          }`}
        />
        <span 
          className={`block w-6 h-0.5 bg-gray-700 absolute transform transition-all duration-300 ease-in-out ${
            !isClosed ? 'opacity-0' : 'opacity-100'
          }`}
        />
        <span 
          className={`block w-6 h-0.5 bg-gray-700 absolute transform transition-all duration-300 ease-in-out ${
            !isClosed ? '-rotate-45' : 'rotate-0 translate-y-1.5'
          }`}
        />
      </button>
      <div className={`h-full pb-10 flex flex-col mt-8 gap-2 ${isClosed && 'items-center '}`}>
        {links.map((link) => {
          const isActive = pathname === link.url;
          return (
            <a 
              key={link.label}
              href={link.url}
              className={`flex items-center gap-x-2 py-2 px-2 rounded-xl transition-colors duration-200 hover:bg-gray-100 ${
                isActive 
                  ? 'bg-[#EFFE6D] text-black' 
                  : 'text-gray-500'
              }`}
            >
              <div>{link.icon}</div>
              <div className={`${isClosed ? 'hidden' : 'block'} transition-opacity duration-300`}>{link.label}</div>
            </a>
          );
        })}
        <div className="flex items-center mt-auto bg-gray-100 gap-2 rounded-xl py-3 px-2">
          <div className="rounded-full w-10 h-10 bg-gray-300"></div>
          <div className={`${isClosed ? 'hidden' : 'block'} transition-opacity duration-300`}>
            <p className="text-sm font-medium">Имя Фамилия</p>
            <p className="text-xs text-gray-500">Должность</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SideBar;