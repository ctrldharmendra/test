// app/loading.tsx

export default function Loading() {
  return (
    <div className="min-h-screen animate-pulse">
      <div className="mx-auto max-w-3xl p-4">
        <div className="mb-6 h-10 w-40 rounded-lg bg-gray-200" />

        <div className="mb-4 h-32 rounded-xl bg-gray-200" />

        <div className="mb-4 h-64 rounded-xl bg-gray-200" />

        <div className="h-64 rounded-xl bg-gray-200" />
      </div>
    </div>
  );
}
