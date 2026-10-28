import { useRef, useEffect } from "react";

/**
 * Hook untuk mengaktifkan scroll horizontal di desktop menggunakan roda mouse (wheel)
 * dan drag-to-scroll menggunakan klik kiri mouse.
 */
export function useHorizontalScroll<T extends HTMLElement = HTMLDivElement>() {
  const elRef = useRef<T | null>(null);

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;

    // 1. Konversi Mouse Wheel (deltaY vertikal) -> Scroll Horizontal (scrollLeft)
    const onWheel = (e: WheelEvent) => {
      // Jika user memakai trackpad dengan deltaX lebih dominan, biarkan gesture native OS
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      if (e.deltaY === 0) return;

      const maxScrollLeft = el.scrollWidth - el.clientWidth;
      if (maxScrollLeft <= 0) return; // Tidak ada konten overflow

      const isScrollingDown = e.deltaY > 0;
      const canScrollRight = el.scrollLeft < maxScrollLeft - 1;
      const canScrollLeft = el.scrollLeft > 1;

      // Jika masih ada ruang horizontal, cegah scroll vertikal halaman dan geser horizontal
      if ((isScrollingDown && canScrollRight) || (!isScrollingDown && canScrollLeft)) {
        e.preventDefault();
        el.scrollLeft += e.deltaY * 0.9;
      }
    };

    // 2. Drag-to-Scroll dengan Mouse (Klik & Geser)
    let isDown = false;
    let startX = 0;
    let scrollStart = 0;
    let hasDragged = false;

    const onMouseDown = (e: MouseEvent) => {
      // Hanya tangkap klik kiri utama
      if (e.button !== 0) return;
      isDown = true;
      hasDragged = false;
      startX = e.pageX - el.offsetLeft;
      scrollStart = el.scrollLeft;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDown) return;
      const currentX = e.pageX - el.offsetLeft;
      const distance = currentX - startX;

      if (Math.abs(distance) > 4) {
        hasDragged = true;
        el.scrollLeft = scrollStart - distance * 1.1;
      }
    };

    const onMouseUp = () => {
      isDown = false;
    };

    const onMouseLeave = () => {
      isDown = false;
    };

    // Cegah trigger click pada tombol badge jika user sedang melakukan drag/geser
    const onClickCapture = (e: MouseEvent) => {
      if (hasDragged) {
        e.preventDefault();
        e.stopPropagation();
        hasDragged = false;
      }
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    el.addEventListener("mouseleave", onMouseLeave);
    el.addEventListener("click", onClickCapture, { capture: true });

    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      el.removeEventListener("mouseleave", onMouseLeave);
      el.removeEventListener("click", onClickCapture, { capture: true });
    };
  }, []);

  return elRef;
}
