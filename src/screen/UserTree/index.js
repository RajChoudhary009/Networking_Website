import React, { useEffect, useState, useContext } from "react";
import { UserContaxt } from "../../store/userData";
import axios from "axios";
import { SERVER_API_URL } from "../../server/server";
import "./index.css";

// 🔥 TREE NODE (Recursive)
const TreeNode = ({ node }) => {
  const [open, setOpen] = useState(true);

  return (
    <div className="tree-node">

      {/* USER CARD */}
      <div className="tree-card" onClick={() => setOpen(!open)}>
        <div className="tree-avatar">
          {node.name?.charAt(0).toUpperCase()}
        </div>

        <div className="tree-info">
          <h4>{node.name}</h4>
          <p>{node.userCode}</p>
        </div>
      </div>

      {/* CHILDREN */}
      {open && node.referrals && node.referrals.length > 0 && (
        <div className="tree-children">
          {node.referrals.map((child) => (
            <TreeNode key={child.userId} node={child} />
          ))}
        </div>
      )}
    </div>
  );
};

// 🔥 MAIN COMPONENT
const UserTree = () => {
  const { userData } = useContext(UserContaxt);
  const [tree, setTree] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchTree = async (id) => {
    try {
      setLoading(true);

      const res = await axios.get(
        `${SERVER_API_URL}/api/users/tree/${id}`
      );

      if (res.data.success) {
        setTree(res.data.data);
      }

    } catch (err) {
      console.error("Tree fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 SAFE USE EFFECT
  useEffect(() => {
    if (userData?.userId) {
      fetchTree(userData.userId);
    }
  }, [userData]);

  return (
    <div className="tree-main">
      <h2 className="tree-title">🌳 User Network</h2>

      {/* 🔥 LOADING */}
      {loading && <p className="tree-loading">Loading...</p>}

      {/* 🔥 TREE */}
      {!loading && tree && <TreeNode node={tree} />}

      {/* 🔥 NO DATA */}
      {!loading && !tree && (
        <p className="tree-loading">No data found</p>
      )}
    </div>
  );
};

export default UserTree;