import { useRef, useEffect } from "react";

/**
 * Hook untuk mengaktifkan scroll horizontal di desktop dengan:
 * 1. Kursor tangan terbuka (grab) saat hover dan tangan menggenggam (grabbing) saat klik/drag.
 * 2. Konversi putaran roda mouse (wheel) vertikal -> pergeseran horizontal.
 * 3. Drag-to-scroll dengan proteksi click capture agar klik tombol tidak terpicu saat menggeser.
 */
export function useHorizontalScroll<T extends HTMLElement = HTMLDivElement>() {
  const elRef = useRef<T | null>(null);

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;

    // Pasang kursor tangan (open hand) secara default
    el.style.cursor = "grab";

    // 1. Konversi Mouse Wheel (deltaY vertikal) -> Scroll Horizontal (scrollLeft)
    const onWheel = (e: WheelEvent) => {
      // Jika user memakai trackpad dengan deltaX dominan, biarkan gesture native OS
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      if (e.deltaY === 0) return;

      const maxScrollLeft = el.scrollWidth - el.clientWidth;
      if (maxScrollLeft <= 0) return; // Tidak ada overflow

      const isScrollingDown = e.deltaY > 0;
      const canScrollRight = el.scrollLeft < maxScrollLeft - 1;
      const canScrollLeft = el.scrollLeft > 1;

      // Hanya prevent default jika container masih bisa digulir horizontal ke arah tersebut
      if ((isScrollingDown && canScrollRight) || (!isScrollingDown && canScrollLeft)) {
        e.preventDefault();
        el.scrollLeft += e.deltaY * 0.9;
      }
    };

    // 2. Drag-to-Scroll dengan Kursor Tangan Menggenggam (Grabbing Hand)
    let isDown = false;
    let startX = 0;
    let scrollStart = 0;
    let hasDragged = false;

    const onMouseDown = (e: MouseEvent) => {
      // Hanya tangkap klik kiri mouse
      if (e.button !== 0) return;
      isDown = true;
      hasDragged = false;
      startX = e.clientX;
      scrollStart = el.scrollLeft;

      // Ubah kursor menjadi tangan menggenggam (closed hand)
      el.style.cursor = "grabbing";
      document.body.style.cursor = "grabbing";
      document.body.style.userSelect = "none";
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDown) return;
      const currentX = e.clientX;
      const distance = currentX - startX;

      if (Math.abs(distance) > 4) {
        hasDragged = true;
        el.scrollLeft = scrollStart - distance * 1.25;
      }
    };

    const onMouseUp = () => {
      if (!isDown) return;
      isDown = false;

      // Kembalikan kursor ke tangan terbuka (open hand)
      el.style.cursor = "grab";
      document.body.style.cursor = "";
      document.body.style.removeProperty("user-select");

      // Berikan delay sangat singkat agar capture click event berhasil memblokir klik tombol
      setTimeout(() => {
        hasDragged = false;
      }, 60);
    };

    // Cegah trigger klik pada tombol/kartu di dalam row jika user sedang melakukan drag/geser
    const onClickCapture = (e: MouseEvent) => {
      if (hasDragged) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    el.addEventListener("click", onClickCapture, { capture: true });

    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      el.removeEventListener("click", onClickCapture, { capture: true });
      el.style.cursor = "";
      document.body.style.cursor = "";
      document.body.style.removeProperty("user-select");
    };
  }, []);

  return elRef;
}
