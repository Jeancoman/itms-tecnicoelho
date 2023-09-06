export default function Pagination() {
  return (
    <nav className="absolute bottom-5 left-8">
      <ul className="flex font-medium">
        <li>
          <div className="relative rounded px-3 py-1.5 text-neutral-600 transition-all duration-300 dark:text-white dark:hover:bg-neutral-700 dark:hover:text-white">
            Previo
          </div>
        </li>
        <li>
          <div className="relative bg-blue-200 rounded px-3 py-1.5 text-neutral-600 transition-all duration-300 dark:text-white dark:hover:bg-neutral-700 dark:hover:text-white">
            1
          </div>
        </li>
        <li aria-current="page">
          <div className="relative rounded px-3 py-1.5 text-neutral-600 transition-all duration-300 dark:text-white dark:hover:bg-neutral-700 dark:hover:text-white">
            2
          </div>
        </li>
        <li>
          <div className="relative rounded px-3 py-1.5 text-neutral-600 transition-all duration-300 dark:text-white dark:hover:bg-neutral-700 dark:hover:text-white">
            3
          </div>
        </li>
        <li>
          <div className="relative rounded px-3 py-1.5 text-neutral-600 transition-all duration-300 dark:text-white dark:hover:bg-neutral-700 dark:hover:text-white">
            Siguiente
          </div>
        </li>
      </ul>
    </nav>
  );
}
