const Footer = () => {
  return (
    <footer className="border-t-2 border-borderline mt-auto bg-surface">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold uppercase tracking-widest text-xl text-foreground">
              FlashMart //
            </span>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-6 items-center">
            <p className="font-display font-medium uppercase tracking-widest text-xs text-muted">
              &copy; {new Date().getFullYear()} FlashMart. Ed. 01.
            </p>
            <div className="hidden sm:block w-1.5 h-1.5 bg-borderline rotate-45"></div>
            <p className="font-display font-medium uppercase tracking-widest text-xs text-muted">
              Premium E-Commerce Platform.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
