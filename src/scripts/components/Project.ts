import { ProjectRules } from "../store/ProjectRules.js";
import { projectState } from "../store/ProjectState.js";
import { Base } from "./Base.js";

export class Project extends Base<HTMLDListElement> {
  private _project: ProjectRules;
  constructor(projectsListId: string, project: ProjectRules) {
    super("project-item", projectsListId, project.id, false);
    this._project = project;
    this._renderProject();
    this._deleteProject();
    this._runDragging();
  }
  private _renderProject(): void {
    const title = this.element.querySelector(
      ".project_title"
    )! as HTMLHeadElement;
    const desc = this.element.querySelector(
      ".project_desc"
    )! as HTMLParagraphElement;
    title.textContent = this._project.title;
    desc.textContent = this._project.desc;
  }

  private _deleteProject(): void {
    const deletButton = this.element.querySelector(
      ".delete"
    )! as HTMLButtonElement;
    deletButton.addEventListener("click", this._handleDeleteProject);
  }
  @autoBind
  private _handleDeleteProject(): void {
    if (confirm("Are you sure you want to delete?")) {
      projectState.deleteProject(this._project.id);
    }
    return;
  }

  private _runDragging(): void {
    this.element.addEventListener("dragstart", this._handlDragStart);
    this.element.addEventListener("dragend", this._handlDragEnd);
    this.element.addEventListener("dragover", this._handleDragOver);
    this.element.addEventListener("drop", this._handleDrop);
  }
  @autoBind
  private _handleDragOver(e: DragEvent): void {
    e.preventDefault();
    const target = e.currentTarget as HTMLElement;

    const boundingRect = target.getBoundingClientRect();
    const offset = e.clientY - boundingRect.top;

    if (offset < boundingRect.height / 2) {
      // target.style.borderTop = "1px solid red";
      // target.style.borderBottom = "none";
    } else {
      // target.style.borderTop = "none";
      // target.style.borderBottom = "1px solid red";
    }
  }

  @autoBind
  private _handleDrop(e: DragEvent): void {
    e.preventDefault();
    const target = e.currentTarget as HTMLElement;
    // target.style.borderTop = "none";
    // target.style.borderBottom = "none";

    const draggedId = e.dataTransfer!.getData("text/plain");
    const draggedElement = document.getElementById(draggedId)!;

    const boundingRect = target.getBoundingClientRect();
    const offset = e.clientY - boundingRect.top;

    if (offset < boundingRect.height / 2) {
      target.parentElement!.insertBefore(draggedElement, target);
    } else {
      target.parentElement!.insertBefore(draggedElement, target.nextSibling);
    }

    this._updateProjectOrder(draggedId, target.id);
  }

  private _updateProjectOrder(draggedId: string, targetId: string): void {
    projectState.reorderProjects(draggedId, targetId);
  }

  @autoBind
  private _handlDragStart(e: DragEvent): void {
    this.element.style.opacity = ".1";
    e.dataTransfer!.setData("text/plain", this._project.id);
    e.dataTransfer!.effectAllowed = "move";
  }

  @autoBind
  private _handlDragEnd(): void {
    console.log("drag end");
    this.element.style.opacity = "1";
  }
}
import { autoBind } from "../decreators/autoBind.js";
