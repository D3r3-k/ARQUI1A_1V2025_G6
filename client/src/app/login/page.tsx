import LoginForm from './components/LoginForm';

export default function Page() {
  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: "url('/invernadero.jpg')" }}
    >
      <LoginForm />
    </div>
  );
}
