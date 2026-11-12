import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="section section--last center">
      <div className="container">
        <span className="script" style={{ fontSize: '4rem' }}>Not found</span>
        <p className="lead" style={{ margin: '10px auto 30px' }}>We couldn’t find that page or reservation.</p>
        <Link href="/" className="btn">Return home</Link>
      </div>
    </section>
  );
}
