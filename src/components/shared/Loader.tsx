"use client";

const Loader = () => {
  return (
    <div className="flex items-center justify-center w-full h-full min-h-[100px]">
      <div className="blob" />
      <style jsx>{`
        .blob {
          width: 80px;
          height: 80px;
          display: grid;
          background: #fff;
          filter: blur(4px) contrast(10);
          padding: 8px;
          mix-blend-mode: darken;
        }

        .blob:before,
        .blob:after {
          content: "";
          grid-area: 1/1;
          width: 32px;
          height: 32px;
          background: #DC143C;
          animation: blob-move 2s infinite;
        }

        .blob:after {
          animation-delay: -1s;
        }

        @keyframes blob-move {
          0% {
            transform: translate(0, 0);
          }
          25% {
            transform: translate(100%, 0);
          }
          50% {
            transform: translate(100%, 100%);
          }
          75% {
            transform: translate(0, 100%);
          }
          100% {
            transform: translate(0, 0);
          }
        }
      `}</style>
    </div>
  );
};

export default Loader;
  