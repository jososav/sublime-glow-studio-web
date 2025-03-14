import Image from "next/image";

const _getInitials = (name) => {
  if (!name) return "??";

  const parts = name.split(" ");

  return parts.length > 1
    ? parts[0][0].toUpperCase() + parts[1][0].toUpperCase()
    : parts[0][0].toUpperCase();
};

const Avatar = ({ user }) => {
  if (!user) {
    return (
      <div className="avatar">
        <div className="avatar-initials">??</div>
        <style jsx>{`
          .avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: #0070f3;
            color: white;
            font-size: 16px;
            font-weight: bold;
          }
          .avatar-initials {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
          }
        `}</style>
      </div>
    );
  }

  const displayName = user.firstName && user.lastName 
    ? `${user.firstName} ${user.lastName}`
    : user.email;

  return (
    <div className="avatar">
      {user.photoURL ? (
        <Image
          src={user.photoURL}
          alt="Perfil"
          width={40}
          height={40}
          className="avatar-image"
        />
      ) : (
        <div className="avatar-initials">{_getInitials(displayName)}</div>
      )}

      <style jsx>{`
        .avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #0070f3;
          color: white;
          font-size: 16px;
          font-weight: bold;
        }
        .avatar-image {
          border-radius: 50%;
        }
        .avatar-initials {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>
    </div>
  );
};

export default Avatar;
