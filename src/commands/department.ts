import { Command } from "commander";
import { getClient, outputResult, outputList, checkError } from "../utils";

export function registerDepartmentCommands(program: Command) {
  const cmd = program.command("department").description("Query department information");

  cmd
    .command("detail")
    .description("Fetch department detail")
    .argument("<departmentId>", "Department ID")
    .option("--user-token <token>", "User token", "")
    .option("--tag-id <tagId>", "Tag ID", "")
    .action(async (departmentId, opts) => {
      const client = getClient();
      const result = await client.fetchDepartmentDetail(departmentId, {
        user_token: opts.userToken || undefined,
        tag_id: opts.tagId || undefined,
      });
      checkError(result);
      outputResult(result, ["id", "name", "parent_id", "has_children", "normal_members", "inactive_members"], "Department Detail");
    });

  cmd
    .command("children")
    .description("Fetch child departments")
    .argument("<departmentId>", "Department ID")
    .option("--user-token <token>", "User token", "")
    .action(async (departmentId, opts) => {
      const client = getClient();
      const result = await client.fetchDepartmentChildren(departmentId, { user_token: opts.userToken || undefined });
      checkError(result);
      if (result.success && result.departments) {
        outputList(result.departments, ["ID", "Name", "Parent ID", "Has Children"], (d: any) => [
          d.id || "", d.name || "", d.parentId || "", String(d.hasChildren || ""),
        ]);
      } else {
        outputResult(result, undefined, "Department Children");
      }
    });

  cmd
    .command("staffs")
    .description("Fetch staff members of a department")
    .argument("<departmentId>", "Department ID")
    .option("--user-token <token>", "User token", "")
    .option("-p, --page <page>", "Page number", "1")
    .option("-s, --size <size>", "Page size", "100")
    .action(async (departmentId, opts) => {
      const client = getClient();
      const result = await client.fetchDepartmentStaffs(departmentId, {
        user_token: opts.userToken || undefined,
        page: parseInt(opts.page),
        page_size: parseInt(opts.size),
      });
      checkError(result);
      if (result.success && result.staffs) {
        outputResult(result, ["has_more", "total"], "Department Staffs");
        outputList(result.staffs, ["Staff ID", "Name", "Gender"], (s: any) => [
          s.staffId || "", s.name || "", s.gender || "",
        ]);
      } else {
        outputResult(result);
      }
    });
}
