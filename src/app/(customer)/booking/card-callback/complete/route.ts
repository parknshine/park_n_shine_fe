// Midtrans returns the customer here after 3DS authentication via an HTTP POST,
// which a page component can't receive. Accept it and 303-redirect to the client
// callback page, which restores the signed token from sessionStorage.
function forward(request: Request): Response {
  const url = new URL(request.url);
  const bookingId = url.searchParams.get("bookingId") ?? "";
  // Relative Location: behind a proxy request.url's host is the internal
  // listener (e.g. 0.0.0.0:3000), so an absolute redirect would leave the
  // public domain. The browser resolves this against the public origin.
  return new Response(null, {
    status: 303,
    headers: {
      Location: `/booking/card-callback?bookingId=${encodeURIComponent(bookingId)}`,
    },
  });
}

export { forward as GET, forward as POST };
