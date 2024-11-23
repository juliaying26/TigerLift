export default function LoadingIcon({ carColor }) {
  const speed = "2.75s";
  return (
    <div className="flex flex-col items-center gap-1 opacity-75">
      <div className="relative w-16 h-16 flex items-center justify-center scale-[0.85] p-2 mt-4">
        {/* Spinning car */}
        <div
          className="absolute w-12 h-12 flex items-center justify-center animate-spin"
          style={{ animationDuration: speed }}
        >
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2">
            {/* Car body with angled front */}
            <div className={`relative w-6 h-2 ${carColor}`}>
              {/* Front angle (hood) */}
              <div
                className={`absolute -right-1 top-0 w-1.5 h-2 ${carColor} skew-x-[5deg] rounded-tr rounded-br`}
              />

              {/* Back angle (trunk) */}
              <div
                className={`absolute -left-1 top-0 w-1.5 h-2 ${carColor} -skew-x-[5deg] rounded-tl rounded-bl`}
              />

              {/* Car roof */}
              <div
                className={`absolute -top-1.5 left-0.5 w-5 h-1.5 ${carColor} rounded-t`}
              />

              {/* Windshield */}
              <div className="absolute -top-1 right-1 w-1.5 h-1 bg-zinc-700 bg-opacity-60 skew-x-[10deg] rounded-sm" />

              {/* Back window */}
              <div className="absolute -top-1 left-1 w-2 h-1 bg-zinc-700 bg-opacity-60 -skew-x-[10deg] rounded-sm" />

              {/* Wheels */}
              <div className="absolute -bottom-1 left-0">
                <svg
                  className="w-2 h-2"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="black"
                >
                  <circle cx="12" cy="12" r="10" fill="black" />
                  <circle cx="12" cy="12" r="4" fill="#A1A1AA" />
                </svg>
              </div>
              <div className="absolute -bottom-1 right-0">
                <svg
                  className="w-2 h-2"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="black"
                >
                  <circle cx="12" cy="12" r="10" fill="black" />
                  <circle cx="12" cy="12" r="4" fill="#A1A1AA" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
      <p className="text-sm font-medium">Loading...</p>
    </div>
  );
}
