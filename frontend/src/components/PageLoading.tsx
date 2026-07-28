export default function PageLoading() {
  return (
    <main className="flex-1 flex items-center justify-center py-32">
      <div className="text-center">
        <div className="loading-sticky inline-block bg-rose w-16 h-16 rounded-sm shadow-sticky mb-4" />
        <p className="font-handwritten text-lg text-rose-bold">jotting this down…</p>
      </div>
    </main>
  );
}
