import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  FiThumbsUp,
  FiMessageCircle,
  FiSearch,
  FiChevronDown,
  FiCheck,
  FiMenu,
  FiX,
  FiPlus,
  FiSliders,
} from "react-icons/fi";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api";
import { useClickOutside } from "../../hooks";
import "./board.css";

// ─── Constants ───────────────────────────────────────────────────────────────

const SORT_OPTIONS = [
  { value: "default", label: "Default Order" },
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "az", label: "A → Z" },
  { value: "za", label: "Z → A" },
];

const MAX_VOTES = 6;

// ─── Pure helpers ─────────────────────────────────────────────────────────────

function applySortAndSearch(cards, search, sort) {
  let result = [...cards];

  if (search.trim()) {
    const q = search.trim().toLowerCase();
    result = result.filter((c) => (c.content || "").toLowerCase().includes(q));
  }

  switch (sort) {
    case "newest":
      result.sort((a, b) => (b.id || 0) - (a.id || 0));
      break;
    case "oldest":
      result.sort((a, b) => (a.id || 0) - (b.id || 0));
      break;
    case "az":
      result.sort((a, b) => (a.content || "").localeCompare(b.content || ""));
      break;
    case "za":
      result.sort((a, b) => (b.content || "").localeCompare(a.content || ""));
      break;
    default:
      break;
  }

  return result;
}

function getCardFormsKey(boardId) {
  return `cardForms_${boardId}`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SortDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useClickOutside(ref, () => setOpen(false), open);

  const selected = useMemo(
    () => SORT_OPTIONS.find((o) => o.value === value),
    [value],
  );

  return (
    <div className="sort-dropdown" ref={ref}>
      <button className="sort-dropdown-btn" onClick={() => setOpen((p) => !p)}>
        <FiSliders size={13} />
        <span className="btn-label">{selected?.label || "Sort"}</span>
        <FiChevronDown size={13} />
      </button>

      {open && (
        <div className="sort-dropdown-menu">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              className={`sort-dropdown-item ${value === opt.value ? "active" : ""}`}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
            >
              {opt.label}
              {value === opt.value && <FiCheck size={12} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function MobileNavMenu({ navigate }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useClickOutside(ref, () => setOpen(false), open);

  return (
    <div className="mobile-nav-menu" ref={ref}>
      <button
        className={`mobile-menu-btn ${open ? "active" : ""}`}
        onClick={() => setOpen((p) => !p)}
        aria-label="Open menu"
        aria-expanded={open}
      >
        {open ? <FiX size={18} /> : <FiMenu size={18} />}
      </button>

      {open && (
        <>
          <div
            className="mobile-menu-backdrop"
            onClick={() => setOpen(false)}
          />

          <div className="mobile-dropdown">
            <button
              className="mobile-dropdown-item"
              onClick={() => {
                navigate("/retroDashboard");
                setOpen(false);
              }}
            >
              <span className="mobile-item-label">← Back to Dashboard</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Board ────────────────────────────────────────────────────────────────────

function Board() {
  const { boardId } = useParams();
  const navigate = useNavigate();

  // ── Auth / role ──
  const name =
    localStorage.getItem("name") || localStorage.getItem("userName") || "User";
  const currentUserId = localStorage.getItem("userId");
  const userRole = localStorage.getItem("role") || "MEMBER";

  // ── Board / columns / cards ──
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [columns, setColumns] = useState([]);
  const [cards, setCards] = useState({});

  // ── Search / sort ──
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("default");

  // ── Add column modal ──
  const [showAddColumn, setShowAddColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState("");
  const [addingColumn, setAddingColumn] = useState(false);

  // ── Inline card editing ──
  const [editingCardId, setEditingCardId] = useState(null);
  const [editValue, setEditValue] = useState("");

  // ── Card input forms (persisted) ──
  const [cardForms, setCardForms] = useState(() => {
    try {
      const saved = localStorage.getItem(getCardFormsKey(boardId));
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // ── Comments ──
  const [openCommentsCardKey, setOpenCommentsCardKey] = useState(null);
  const [commentsByCard, setCommentsByCard] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const [postingCommentCard, setPostingCommentCard] = useState(null);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentValue, setEditCommentValue] = useState("");

  // ── Votes ──
  const [userVotesByCard, setUserVotesByCard] = useState({});
  const [remainingVotes, setRemainingVotes] = useState(MAX_VOTES);
  const [cardVoteCounts, setCardVoteCounts] = useState({});

  // ── Column / card menus ──
  const [openColumnMenu, setOpenColumnMenu] = useState(null);
  const [editingColumnId, setEditingColumnId] = useState(null);
  const [editColumnTitle, setEditColumnTitle] = useState("");
  const [openCardMenu, setOpenCardMenu] = useState(null);
  const columnMenuRef = useRef(null);
  const cardMenuRef = useRef(null);

  // ─── Derived ────────────────────────────────────────────────────────────────

  const isCreator = useMemo(() => {
    if (!board || !currentUserId) return false;
    return [
      board.userId,
      board.createdBy?.id,
      board.createdBy,
      board.ownerId,
      board.user_id,
      board.created_by,
    ].some((id) => id != null && String(id) === String(currentUserId));
  }, [board, currentUserId]);

  const canManageBoard = userRole === "ADMIN" || isCreator;

  // ─── Click-outside for menus ────────────────────────────────────────────────

  const closeMenus = useCallback(() => {
    setOpenColumnMenu(null);
    setOpenCardMenu(null);
  }, []);
  const menuRefs = useMemo(() => [columnMenuRef, cardMenuRef], []);
  useClickOutside(menuRefs, closeMenus);

  // ─── Persist card forms ─────────────────────────────────────────────────────

  useEffect(() => {
    try {
      localStorage.setItem(getCardFormsKey(boardId), JSON.stringify(cardForms));
    } catch {
      /* ignore quota errors */
    }
  }, [cardForms, boardId]);

  // ─── Data fetching ──────────────────────────────────────────────────────────

  // Fetches cards for specific columns — used after add/delete card
  const fetchColumnCards = useCallback(async (columnId) => {
    try {
      const data = await api.get(`/api/cards/column/${columnId}`);
      setCards((prev) => ({
        ...prev,
        [String(columnId)]: Array.isArray(data) ? data : [],
      }));
    } catch (err) {
      // Error fetching column cards
    }
  }, []);

  const fetchBoard = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch board and columns first
      const [boardData, columnsData] = await Promise.all([
        api.get(`/api/boards/${boardId}`),
        api.get(`/api/board-columns/board/${boardId}`),
      ]);

      setBoard(boardData);

      const sortedColumns = Array.isArray(columnsData)
        ? columnsData.sort((a, b) => (a.position || 0) - (b.position || 0))
        : [];
      setColumns(sortedColumns);

      // Fetch cards for each column separately (since backend doesn't return columnId)
      const cardsByColumn = {};
      
      await Promise.all(
        sortedColumns.map(async (column) => {
          try {
            const columnCards = await api.get(`/api/cards/column/${column.id}`);
            cardsByColumn[String(column.id)] = Array.isArray(columnCards) ? columnCards : [];
          } catch (err) {
            cardsByColumn[String(column.id)] = [];
          }
        })
      );

      setCards(cardsByColumn);
    } catch (err) {
      setError(err.message || "Failed to load board");
    } finally {
      setLoading(false);
    }
  }, [boardId]);

  const fetchUserVotingInfo = useCallback(async () => {
    if (!currentUserId || !boardId) return;
    try {
      const [remainingData, votesData] = await Promise.all([
        api.get(`/api/votes/board/${boardId}/user/${currentUserId}/remaining`),
        api.get(`/api/votes/board/${boardId}`),
      ]);

      setRemainingVotes(remainingData.remaining ?? MAX_VOTES);

      const voteCounts = {};
      const userVoteCounts = {};

      if (Array.isArray(votesData)) {
        votesData.forEach((vote) => {
          const cardId = vote.cardId || vote.card_id;
          const voteUserId = vote.userId || vote.user_id;
          if (cardId) voteCounts[cardId] = (voteCounts[cardId] || 0) + 1;
          if (voteUserId === parseInt(currentUserId, 10) && cardId) {
            userVoteCounts[cardId] = (userVoteCounts[cardId] || 0) + 1;
          }
        });
      }

      setCardVoteCounts(voteCounts);
      setUserVotesByCard(userVoteCounts);
    } catch (err) {
      // Error fetching voting info
    }
  }, [boardId, currentUserId]);

  useEffect(() => {
    fetchBoard();
  }, [fetchBoard]);

  useEffect(() => {
    if (board?.id && Object.keys(cards).length > 0) fetchUserVotingInfo();
  }, [board, cards, fetchUserVotingInfo]);

  // ─── Voting ─────────────────────────────────────────────────────────────────

  const addVote = useCallback(
    async (cardId) => {
      if (!currentUserId) return alert("You must be logged in to vote");
      if (remainingVotes <= 0) return alert("You have used all your votes!");

      const body = {
        cardId: parseInt(cardId, 10),
        userId: parseInt(currentUserId, 10),
        boardId: parseInt(boardId, 10),
      };

      const applyOptimistic = () => {
        setUserVotesByCard((p) => ({ ...p, [cardId]: (p[cardId] || 0) + 1 }));
        setRemainingVotes((p) => p - 1);
        setCardVoteCounts((p) => ({ ...p, [cardId]: (p[cardId] || 0) + 1 }));
      };

      try {
        try {
          await api.post("/api/votes", body);
        } catch {
          await api.post(`/api/votes/card/${body.cardId}/user/${body.userId}`, {
            boardId: body.boardId,
          });
        }
        applyOptimistic();
      } catch (err) {
        alert("Failed to add vote: " + err.message);
      }
    },
    [boardId, currentUserId, remainingVotes],
  );

  const removeVote = useCallback(
    async (cardId) => {
      if (!currentUserId) return alert("You must be logged in to vote");
      if ((userVotesByCard[cardId] || 0) === 0)
        return alert("You haven't voted on this card");

      try {
        await api.delete("/api/votes", {
          body: JSON.stringify({
            cardId: parseInt(cardId, 10),
            userId: parseInt(currentUserId, 10),
          }),
        });
        setUserVotesByCard((p) => ({
          ...p,
          [cardId]: Math.max(0, (p[cardId] || 0) - 1),
        }));
        setRemainingVotes((p) => p + 1);
        setCardVoteCounts((p) => ({
          ...p,
          [cardId]: Math.max(0, (p[cardId] || 0) - 1),
        }));
      } catch (err) {
        alert("Failed to remove vote: " + err.message);
      }
    },
    [currentUserId, userVotesByCard],
  );

  // ─── Card forms ──────────────────────────────────────────────────────────────

  const addCardForm = useCallback((columnId) => {
    setCardForms((prev) => [
      ...prev,
      { formId: Date.now() + Math.random(), columnId, input: "" },
    ]);
  }, []);

  const updateCardForm = useCallback((formId, value) => {
    setCardForms((prev) =>
      prev.map((f) => (f.formId === formId ? { ...f, input: value } : f)),
    );
  }, []);

  const removeCardForm = useCallback((formId) => {
    setCardForms((prev) => prev.filter((f) => f.formId !== formId));
  }, []);

  const saveCard = useCallback(
    async (formId, columnId, inputValue) => {
      if (!inputValue.trim())
        return alert("Please enter something for the card");

      // Optimistic: show card instantly, no spinner needed
      const tempId = `temp-${Date.now()}`;
      const tempCard = { id: tempId, content: inputValue, columnId };
      removeCardForm(formId);
      setCards((prev) => ({
        ...prev,
        [String(columnId)]: [...(prev[String(columnId)] || []), tempCard],
      }));

      try {
        const created = await api.post("/api/cards", {
          content: inputValue,
          columnId,
          userId: currentUserId,
          boardId,
        });
        // Swap temp card with real server card (gets real id, timestamps, etc.)
        setCards((prev) => ({
          ...prev,
          [String(columnId)]: prev[String(columnId)].map((c) =>
            c.id === tempId ? created : c,
          ),
        }));
      } catch (err) {
        // Rollback: remove temp card and restore the form
        setCards((prev) => ({
          ...prev,
          [String(columnId)]: prev[String(columnId)].filter(
            (c) => c.id !== tempId,
          ),
        }));
        setCardForms((prev) => [
          ...prev,
          { formId, columnId, input: inputValue },
        ]);
        alert("Error creating card: " + (err.message || "Unknown"));
      }
    },
    [boardId, currentUserId, removeCardForm],
  );

  // ─── Column CRUD ─────────────────────────────────────────────────────────────

  const addColumn = useCallback(async () => {
    if (!canManageBoard)
      return alert("Only the board creator or admin can add columns");
    if (!newColumnTitle.trim()) return alert("Please enter a column title");
    setAddingColumn(true);
    try {
      await api.post(`/api/board-columns/${boardId}`, {
        boardId: Number(boardId),
        title: newColumnTitle.trim(),
        position: columns.length,
      });
      setNewColumnTitle("");
      setShowAddColumn(false);
      await fetchBoard();
    } catch (err) {
      alert("Error adding column: " + (err.message || "Unknown"));
    } finally {
      setAddingColumn(false);
    }
  }, [boardId, canManageBoard, columns.length, fetchBoard, newColumnTitle]);

  const updateColumn = useCallback(
    async (columnId) => {
      if (!canManageBoard)
        return alert("Only the board creator or admin can edit columns");
      if (!editColumnTitle.trim()) return alert("Column title cannot be empty");
      try {
        await api.patch(`/api/board-columns/${columnId}`, {
          title: editColumnTitle.trim(),
        });
        setEditingColumnId(null);
        setEditColumnTitle("");
        setOpenColumnMenu(null);
        await fetchBoard();
      } catch (err) {
        alert("Error updating column: " + (err.message || "Unknown"));
      }
    },
    [canManageBoard, editColumnTitle, fetchBoard],
  );

  const deleteColumn = useCallback(
    async (columnId) => {
      if (!canManageBoard)
        return alert("Only the board creator or admin can delete columns");
      if (
        !window.confirm(
          "Are you sure you want to delete this column? All cards in this column will also be deleted.",
        )
      )
        return;
      try {
        await api.delete(`/api/board-columns/${columnId}`);
        setColumns((prev) => prev.filter((col) => col.id !== columnId));
        setCards((prev) => {
          const updated = { ...prev };
          delete updated[String(columnId)];
          return updated;
        });
        setOpenColumnMenu(null);
      } catch (err) {
        alert("Error deleting column: " + (err.message || "Unknown"));
      }
    },
    [canManageBoard],
  );

  // ─── Card CRUD ───────────────────────────────────────────────────────────────

  const deleteCard = useCallback(async (cardId) => {
    if (!window.confirm("Are you sure you want to delete this card?")) return;
    try {
      await api.delete(`/api/cards/${cardId}`);
      setCards((prev) => {
        const updated = {};
        for (const colId in prev) {
          updated[colId] = prev[colId].filter(
            (c) => String(c.id) !== String(cardId),
          );
        }
        return updated;
      });
    } catch {
      alert("Error deleting card");
    }
  }, []);

  const updateCard = useCallback(
    async (cardId, columnId) => {
      if (!editValue.trim()) return alert("Card cannot be empty");
      try {
        const updatedCard = await api.put(`/api/cards/${cardId}`, {
          content: editValue,
        });
        setCards((prev) => ({
          ...prev,
          [String(columnId)]: prev[String(columnId)].map((card) =>
            card.id === cardId
              ? { ...card, content: updatedCard.content }
              : card,
          ),
        }));
        setEditingCardId(null);
        setEditValue("");
      } catch {
        alert("Error updating card");
      }
    },
    [editValue],
  );

  // ─── Board delete ────────────────────────────────────────────────────────────

  const deleteBoard = useCallback(async () => {
    if (!canManageBoard)
      return alert("Only the board creator or admin can delete the board");
    if (
      !window.confirm(
        "Are you sure you want to delete this board? All columns and cards will be permanently deleted.",
      )
    )
      return;
    try {
      await api.delete(`/api/boards/${boardId}`);
      navigate("/retroDashboard");
    } catch (err) {
      alert("Error deleting board: " + (err.message || "Unknown"));
    }
  }, [boardId, canManageBoard, navigate]);

  // ─── Comments ────────────────────────────────────────────────────────────────

  const fetchCommentsFor = useCallback(async (cardId) => {
    try {
      const data = await api.get(`/api/comments/card/${cardId}`);
      setCommentsByCard((p) => ({
        ...p,
        [String(cardId)]: Array.isArray(data) ? data : [],
      }));
    } catch {
      setCommentsByCard((p) => ({ ...p, [String(cardId)]: [] }));
    }
  }, []);

  const postComment = useCallback(
    async (cardId) => {
      const key = String(cardId);
      const content = (commentInputs[key] || "").trim();
      if (!content) return alert("Please enter a comment");
      setPostingCommentCard(key);
      try {
        await api.post("/api/comments", {
          cardId,
          userId: currentUserId,
          content,
        });
        setCommentInputs((p) => ({ ...p, [key]: "" }));
        await fetchCommentsFor(cardId);
      } catch (err) {
        alert("Error posting comment: " + (err.message || "Unknown"));
      } finally {
        setPostingCommentCard(null);
      }
    },
    [commentInputs, currentUserId, fetchCommentsFor],
  );

  const deleteComment = useCallback(async (commentId, cardId) => {
    if (!window.confirm("Delete this comment?")) return;
    try {
      await api.delete(`/api/comments/${commentId}`);
      setCommentsByCard((prev) => ({
        ...prev,
        [String(cardId)]: prev[String(cardId)].filter(
          (c) => c.id !== commentId,
        ),
      }));
    } catch {
      alert("Error deleting comment");
    }
  }, []);

  const updateComment = useCallback(
    async (commentId, cardId) => {
      if (!editCommentValue.trim()) return alert("Comment cannot be empty");
      try {
        const updatedComment = await api.put(`/api/comments/${commentId}`, {
          content: editCommentValue,
        });
        setCommentsByCard((prev) => ({
          ...prev,
          [String(cardId)]: prev[String(cardId)].map((comment) =>
            comment.id === commentId
              ? {
                  ...comment,
                  content: updatedComment.content,
                  message: updatedComment.content,
                }
              : comment,
          ),
        }));
        setEditingCommentId(null);
        setEditCommentValue("");
      } catch {
        alert("Error updating comment");
      }
    },
    [editCommentValue],
  );

  // ─── Early returns ────────────────────────────────────────────────────────────

  if (loading)
    return (
      <div className="loading-state">
        <span className="spinner" />
      </div>
    );
  if (error)
    return (
      <div className="board-error">
        <p>{error}</p>
        <button onClick={() => navigate("/retroDashboard")}>
          Back to Dashboard
        </button>
      </div>
    );
  if (!board)
    return (
      <div className="board-error">
        <p>Board not found</p>
        <button onClick={() => navigate("/retroDashboard")}>
          Back to Dashboard
        </button>
      </div>
    );

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="board-container">
      <header className="board-header">
        <div className="mobile-only">
          <MobileNavMenu navigate={navigate} />
        </div>

        <div className="board-header-left">
          <button
            className="back-to-dashboard-btn desktop-only"
            onClick={() => navigate("/retroDashboard")}
            title="Back to Dashboard"
          >
            ← Dashboard
          </button>
          <div className="board-logo">{board.title}</div>
        </div>

        <div className="board-header-right">
          <div className="vote-counter">
            <span className="vote-counter-value">
              {remainingVotes} / {MAX_VOTES}
            </span>
            <span className="vote-counter-label">votes</span>
          </div>
        </div>
      </header>

      <div className="board-filters-section">
        <div className="filters-left">
          <div className="board-search-wrapper">
            <FiSearch className="board-search-icon" size={14} />
            <input
              className="board-search-input"
              type="text"
              placeholder="Search cards..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                className="board-search-clear"
                onClick={() => setSearch("")}
              >
                <FiX size={14} />
              </button>
            )}
          </div>
          <SortDropdown value={sortBy} onChange={setSortBy} />
        </div>
        
        {canManageBoard && (
          <button
            className="add-column-btn"
            onClick={() => setShowAddColumn(true)}
          >
            <FiPlus size={14} />
            <span>Add Column</span>
          </button>
        )}
      </div>

      <main className="board-main">
        <div className="board-columns">
          {columns.length > 0 ? (
            columns.map((column) => {
              const colKey = String(column.id);
              const rawCards = cards[colKey] || [];
              const columnCards = applySortAndSearch(rawCards, search, sortBy);

              return (
                <div key={colKey} className="board-column">
                  {/* Column header */}
                  <div className="column-header">
                    {editingColumnId === column.id ? (
                      <div className="column-edit-form">
                        <input
                          className="column-edit-input"
                          type="text"
                          value={editColumnTitle}
                          onChange={(e) => setEditColumnTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") updateColumn(column.id);
                            if (e.key === "Escape") {
                              setEditingColumnId(null);
                              setEditColumnTitle("");
                            }
                          }}
                          autoFocus
                        />
                        <button
                          className="column-save-btn"
                          onClick={() => updateColumn(column.id)}
                        >
                          ✔
                        </button>
                        <button
                          className="column-cancel-btn"
                          onClick={() => {
                            setEditingColumnId(null);
                            setEditColumnTitle("");
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <>
                        <h2 className="column-title">
                          {column.title || column.name || "Untitled"}
                        </h2>
                        {canManageBoard && (
                          <div
                            className="column-menu-wrapper"
                            ref={
                              openColumnMenu === column.id
                                ? columnMenuRef
                                : null
                            }
                          >
                            <button
                              className="column-menu"
                              onClick={() =>
                                setOpenColumnMenu(
                                  openColumnMenu === column.id
                                    ? null
                                    : column.id,
                                )
                              }
                            >
                              ⋮
                            </button>
                            {openColumnMenu === column.id && (
                              <div className="column-dropdown-menu">
                                <button
                                  className="column-dropdown-item"
                                  onClick={() => {
                                    setEditingColumnId(column.id);
                                    setEditColumnTitle(
                                      column.title || column.name || "",
                                    );
                                    setOpenColumnMenu(null);
                                  }}
                                >
                                  <span>✎</span> Edit Column
                                </button>
                                <button
                                  className="column-dropdown-item delete"
                                  onClick={() => deleteColumn(column.id)}
                                >
                                  <span>✕</span> Delete Column
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Cards */}
                  <div className="column-items">
                    <button
                      className="add-item-btn"
                      onClick={() => addCardForm(column.id)}
                    >
                      +
                    </button>

                    {cardForms
                      .filter((f) => f.columnId === column.id)
                      .map((form) => (
                        <div key={form.formId} className="card-input-form">
                          <textarea
                            className="card-textarea"
                            placeholder="Type something......"
                            value={form.input}
                            onChange={(e) =>
                              updateCardForm(form.formId, e.target.value)
                            }
                            autoFocus
                          />
                          <div className="card-form-buttons">
                            <button
                              className="save-card-btn"
                              onClick={() =>
                                saveCard(form.formId, form.columnId, form.input)
                              }
                            >
                              ✔
                            </button>
                            <button
                              className="cancel-card-btn"
                              onClick={() => removeCardForm(form.formId)}
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ))}

                    {columnCards.length === 0 && search && (
                      <div className="no-results">
                        No cards match "{search}"
                      </div>
                    )}

                    {columnCards.map((card, idx) => {
                      const realId = card.id;
                      const cardKey =
                        realId != null ? String(realId) : `tmp-${idx}`;
                      const commentsForCard =
                        commentsByCard[String(realId)] || [];

                      return (
                        <div key={cardKey} className="card-item">
                          <div className="card-header-row">
                            {editingCardId === realId ? (
                              <div className="card-edit-wrapper">
                                <textarea
                                  className="card-textarea"
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  autoFocus
                                />
                                <div className="card-form-buttons">
                                  <button
                                    className="save-card-btn"
                                    onClick={() =>
                                      updateCard(realId, column.id)
                                    }
                                  >
                                    ✔
                                  </button>
                                  <button
                                    className="cancel-card-btn"
                                    onClick={() => {
                                      setEditingCardId(null);
                                      setEditValue("");
                                    }}
                                  >
                                    ✕
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <p className="card-text">{card.content}</p>
                                <div
                                  className="card-menu-wrapper"
                                  ref={
                                    openCardMenu === cardKey
                                      ? cardMenuRef
                                      : null
                                  }
                                >
                                  <button
                                    className="card-menu-btn"
                                    onClick={() =>
                                      setOpenCardMenu(
                                        openCardMenu === cardKey
                                          ? null
                                          : cardKey,
                                      )
                                    }
                                  >
                                    ⋮
                                  </button>
                                  {openCardMenu === cardKey && (
                                    <div className="card-dropdown-menu">
                                      <button
                                        className="card-dropdown-item"
                                        onClick={() => {
                                          setEditingCardId(realId);
                                          setEditValue(card.content);
                                          setOpenCardMenu(null);
                                        }}
                                      >
                                        <span>✎</span> Edit Card
                                      </button>
                                      <button
                                        className="card-dropdown-item delete"
                                        onClick={() => {
                                          deleteCard(realId);
                                          setOpenCardMenu(null);
                                        }}
                                      >
                                        <span>✕</span> Delete Card
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </>
                            )}
                          </div>

                          {/* Footer: votes + comments */}
                          <div className="card-footer">
                            <div className="vote-controls">
                              <button
                                className="vote-btn"
                                onClick={() =>
                                  realId != null && addVote(realId)
                                }
                                disabled={remainingVotes <= 0}
                                title={
                                  remainingVotes <= 0
                                    ? "No votes remaining"
                                    : "Add vote"
                                }
                              >
                                <FiThumbsUp size={13} />
                                <span>{cardVoteCounts[realId] || 0}</span>
                              </button>
                              {(userVotesByCard[realId] || 0) > 0 && (
                                <button
                                  className="remove-vote-btn"
                                  onClick={() =>
                                    realId != null && removeVote(realId)
                                  }
                                  title={`Remove vote (you have ${userVotesByCard[realId]} vote${userVotesByCard[realId] > 1 ? "s" : ""} on this card)`}
                                >
                                  −
                                </button>
                              )}
                            </div>

                            <button
                              className="comment-btn"
                              onClick={async () => {
                                if (openCommentsCardKey === cardKey)
                                  return setOpenCommentsCardKey(null);
                                setOpenCommentsCardKey(cardKey);
                                if (realId != null)
                                  await fetchCommentsFor(realId);
                              }}
                            >
                              <FiMessageCircle size={13} />
                              {commentsForCard.length > 0 && (
                                <span>{commentsForCard.length}</span>
                              )}
                            </button>
                          </div>

                          {/* Comments section */}
                          {openCommentsCardKey === cardKey && (
                            <div className="card-comments-section">
                              <textarea
                                className="comment-input"
                                placeholder="Add a comment..."
                                value={commentInputs[String(realId)] || ""}
                                onChange={(e) =>
                                  setCommentInputs((p) => ({
                                    ...p,
                                    [String(realId)]: e.target.value,
                                  }))
                                }
                              />
                              <div className="comment-actions">
                                <button
                                  className="cancel-card-btn"
                                  onClick={() => setOpenCommentsCardKey(null)}
                                  disabled={
                                    postingCommentCard === String(realId)
                                  }
                                >
                                  ✕
                                </button>
                                <button
                                  className="save-card-btn"
                                  onClick={() =>
                                    realId != null && postComment(realId)
                                  }
                                  disabled={
                                    postingCommentCard === String(realId)
                                  }
                                >
                                  {postingCommentCard === String(realId)
                                    ? "Posting..."
                                    : "Post"}
                                </button>
                              </div>

                              {commentsForCard.length > 0 && (
                                <div className="comments-list">
                                  {commentsForCard.map((c, i) => (
                                    <div
                                      key={c.id || i}
                                      className="comment-item"
                                    >
                                      {editingCommentId === c.id ? (
                                        <div className="comment-edit-form">
                                          <textarea
                                            className="comment-input"
                                            value={editCommentValue}
                                            onChange={(e) =>
                                              setEditCommentValue(
                                                e.target.value,
                                              )
                                            }
                                            autoFocus
                                          />
                                          <div className="comment-actions">
                                            <button
                                              className="cancel-card-btn"
                                              onClick={() => {
                                                setEditingCommentId(null);
                                                setEditCommentValue("");
                                              }}
                                            >
                                              ✕
                                            </button>
                                            <button
                                              className="save-card-btn"
                                              onClick={() =>
                                                updateComment(c.id, realId)
                                              }
                                            >
                                              Save
                                            </button>
                                          </div>
                                        </div>
                                      ) : (
                                        <>
                                          <div className="comment-content">
                                            <div>{c.message || c.content}</div>
                                            <div className="comment-written-by">
                                              by
                                              <br />
                                              {c.userName ||
                                                c.author?.name ||
                                                name}
                                            </div>
                                          </div>
                                          <div className="comment-buttons">
                                            <button
                                              className="edit-btn"
                                              onClick={() => {
                                                setEditingCommentId(c.id);
                                                setEditCommentValue(
                                                  c.message || c.content,
                                                );
                                              }}
                                              title="Edit comment"
                                            >
                                              ✎
                                            </button>
                                            <button
                                              className="delete-btn"
                                              onClick={() =>
                                                c.id != null &&
                                                deleteComment(c.id, realId)
                                              }
                                              title="Delete comment"
                                            >
                                              ✕
                                            </button>
                                          </div>
                                        </>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="no-columns">No columns available</div>
          )}
        </div>
      </main>

      {/* Add Column Modal */}
      {showAddColumn && (
        <div className="modal-overlay" onClick={() => setShowAddColumn(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Add Column</h2>
              <button
                className="modal-close"
                onClick={() => setShowAddColumn(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <label className="modal-label">Column Title</label>
              <input
                className="modal-input"
                type="text"
                placeholder="e.g. Went Well, To Improve..."
                value={newColumnTitle}
                onChange={(e) => setNewColumnTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addColumn()}
                autoFocus
              />
            </div>
            <div className="modal-footer">
              <button
                className="cancel-card-btn"
                onClick={() => {
                  setShowAddColumn(false);
                  setNewColumnTitle("");
                }}
                disabled={addingColumn}
              >
                Cancel
              </button>
              <button
                className="save-card-btn"
                onClick={addColumn}
                disabled={addingColumn}
              >
                {addingColumn ? "Adding..." : "Add Column"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Board;
