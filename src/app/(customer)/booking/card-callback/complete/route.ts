// Midtrans returns the customer here after 3DS authentication via an HTTP POST,
// which a page component can't receive. Accept it and 303-redirect to the client
// callback page, which restores the signed token from sessionStorage.
function forward(request: Request): Response {
  const url = new URL(request.url);
  const bookingId = url.searchParams.get("bookingId") ?? "";
  const target = new URL(`/booking/card-callback?bookingId=${encodeURIComponent(bookingId)}`, url);
  return Response.redirect(target, 303);
}

export { forward as GET, forward as POST };
