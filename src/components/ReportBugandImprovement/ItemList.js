const ItemList = ({ items, activeTab }) => {
  const tabColors = {
    bug: "text-red-600",
    improvement: "text-yellow-500",
    query: "text-blue-500",
  };
  return (
    <div className="mb-2 ">
      <p className={`${tabColors[activeTab] || "text-gray-300"} p-2`}>
        {items.length}
      </p>
      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-center justify-between py-1 px-2 rounded shadow mb-1 text-gray-300"
        >
          <span>{item.title}</span>
          <span className="text-xs ">Assigned by: {item.assignedTo}</span>
        </div>
      ))}
    </div>
  );
};

export default ItemList;
