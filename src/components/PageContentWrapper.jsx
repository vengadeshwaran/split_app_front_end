const PageContentWrapper = ({ children, className = "" }) => {
  return (
    <div className={`max-w-7xl mx-auto w-full px-4 md:px-6 flex-1 flex flex-col md:flex-row ${className}`}>
      {children}
    </div>
  );
};

export default PageContentWrapper;
