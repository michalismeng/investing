import { FC } from "react";

interface FooterProps extends React.HTMLAttributes<HTMLDivElement> {}

const Footer: FC<FooterProps> = () => {
  return (
    <footer className="footer footer-center p-4 bg-base-300 text-base-content">
      <aside>
        <p>
          Copyright © 2024 - All right reserved by Stock Research Platform Ltd
        </p>
      </aside>
    </footer>
  );
};

export default Footer;